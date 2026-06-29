import threading
from django.conf import settings
from django.db import close_old_connections
from celery import shared_task as celery_shared_task

def custom_shared_task(func):
    """
    A custom wrapper for Celery's @shared_task.
    - If USE_REDIS_CELERY is True: Acts as a standard Celery task (queues in Redis).
    - If USE_REDIS_CELERY is False: Spawns a background Python thread to run 
      the task asynchronously, preventing HTTP requests from blocking.
    """
    # Register with Celery
    task = celery_shared_task(func)
    
    # Save the original Celery delay method
    original_delay = task.delay
    
    def async_delay(*args, **kwargs):
        # Retrieve the setting dynamically (default to False if not set)
        use_redis = getattr(settings, "USE_REDIS_CELERY", False)
        
        if use_redis:
            return original_delay(*args, **kwargs)
        else:
            # Free Mode: Run in a separate Python background thread
            def thread_target():
                try:
                    func(*args, **kwargs)
                finally:
                    # Clean up DB connections to prevent memory/connection leaks in thread
                    close_old_connections()
            
            thread = threading.Thread(target=thread_target)
            thread.daemon = True
            thread.start()
            return None
            
    # Override the .delay() method on the Celery task object
    task.delay = async_delay
    return task
