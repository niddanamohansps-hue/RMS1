from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from jobs.models import ExistingRole, JobCategory, JobPosting
from interviews.models import Panelist
from users.models import CandidateProfile
from applications.models import GeneralApplication

User = get_user_model()

class Command(BaseCommand):
    help = "Seed the database with initial RMS data from the frontend mockups"

    def handle(self, *args, **kwargs):
        self.stdout.write("[*] Seeding database...")

        # ── Admin user ─────────────────────────────────────────────────────────
        admin, created = User.objects.get_or_create(
            email="hr@southpoint.edu",
            defaults={
                "username": "hr@southpoint.edu",
                "first_name": "HR",
                "last_name": "Admin",
                "role": "admin",
                "is_staff": True,
                "is_superuser": True,
            }
        )
        if not created:
            admin.username = "hr@southpoint.edu"
            admin.email = "hr@southpoint.edu"
            admin.is_superuser = True
            admin.is_staff = True
            admin.role = "admin"
            admin.set_password("Admin@123")
            admin.save()
            self.stdout.write("  [OK] HR Admin user updated (hr@southpoint.edu / Admin@123)")
        else:
            admin.set_password("Admin@123")
            admin.save()
            self.stdout.write("  [OK] HR Admin user created (hr@southpoint.edu / Admin@123)")

        # ── Panelist user ──────────────────────────────────────────────────────
        panelist_user, created = User.objects.get_or_create(
            email="panelist@southpoint.edu",
            defaults={
                "username": "panelist@southpoint.edu",
                "first_name": "Dr.",
                "last_name": "Roy",
                "role": "admin",
                "is_staff": True,
            }
        )
        if not created:
            panelist_user.username = "panelist@southpoint.edu"
            panelist_user.role = "admin"
            panelist_user.set_password("Panel@123")
            panelist_user.save()
        else:
            panelist_user.set_password("Panel@123")
            panelist_user.save()

        # ── Existing Roles ─────────────────────────────────────────────────────
        ROLES = [
            ("ROL-001", "Science",        "Mathematics Teacher",        "Full-time", 4, 3, "Active",   "3-5", "40,000-60,000"),
            ("ROL-002", "Science",        "Physics Teacher",            "Full-time", 2, 2, "Active",   "3-5", "40,000-60,000"),
            ("ROL-003", "Science",        "Chemistry Teacher",          "Full-time", 2, 1, "Inactive", "2-4", "35,000-50,000"),
            ("ROL-004", "Science",        "Lab Assistant",              "Part-time", 3, 0, "Inactive", "1-2", "18,000-25,000"),
            ("ROL-005", "Commerce",       "Accountancy Teacher",        "Full-time", 3, 3, "Active",   "3-5", "40,000-60,000"),
            ("ROL-006", "Commerce",       "Business Studies Teacher",   "Full-time", 2, 1, "Inactive", "3-5", "40,000-60,000"),
            ("ROL-007", "Arts",           "Drawing Teacher",            "Full-time", 2, 2, "Active",   "2-4", "30,000-45,000"),
            ("ROL-008", "Arts",           "Music Teacher",              "Part-time", 1, 0, "Inactive", "2-4", "25,000-35,000"),
            ("ROL-009", "Administration", "Office Coordinator",         "Full-time", 2, 1, "Inactive", "2-4", "25,000-35,000"),
            ("ROL-010", "Administration", "Receptionist",               "Full-time", 1, 1, "Active",   "1-3", "20,000-30,000"),
            ("ROL-011", "Sports",         "Physical Education Teacher", "Full-time", 2, 2, "Active",   "2-4", "35,000-50,000"),
            ("ROL-012", "Languages",      "Hindi Teacher",              "Full-time", 3, 2, "Inactive", "3-5", "38,000-55,000"),
            ("ROL-013", "Languages",      "English Teacher",            "Full-time", 4, 4, "Active",   "3-5", "40,000-60,000"),
        ]
        for r in ROLES:
            ExistingRole.objects.get_or_create(
                role_id=r[0],
                defaults={
                    "department": r[1], "role": r[2], "type": r[3],
                    "headcount": r[4], "filled": r[5], "status": r[6],
                    "experience": r[7], "salary_range": r[8],
                },
            )
        self.stdout.write(f"  [OK] {len(ROLES)} existing roles seeded")

        # ── Panelists ──────────────────────────────────────────────────────────
        PANELISTS = [
            ("Dr. Roy",    "dr_roy@school.edu",    "9876543210"),
            ("Mr. Patel",  "mr_patel@school.edu",  "9876543211"),
            ("Ms. Nisha",  "ms_nisha@school.edu",  "9876543212"),
            ("Mr. Kumar",  "mr_kumar@school.edu",  "9876543213"),
            ("Mr. Rajan",  "mr_rajan@school.edu",  "9876543214"),
            ("Dr. Ananya", "dr_ananya@school.edu", "9876543215"),
        ]
        for name, email, phone in PANELISTS:
            p, created = Panelist.objects.get_or_create(email=email, defaults={"name": name, "phone": phone})
            if not created:
                p.save()
        self.stdout.write(f"  [OK] {len(PANELISTS)} panelists seeded and user accounts synchronized")

        # ── Job Categories ─────────────────────────────────────────────────────
        academic_cat, _ = JobCategory.objects.get_or_create(name="Academic Positions")
        admin_cat, _ = JobCategory.objects.get_or_create(name="Administrative Positions")
        ops_cat, _ = JobCategory.objects.get_or_create(name="Operations & Support Positions")
        category_map = {
            "Academic Positions": academic_cat,
            "Administrative Positions": admin_cat,
            "Operations & Support Positions": ops_cat
        }
        self.stdout.write(f"  [OK] {len(category_map)} job categories seeded")

        # ── Job Postings ───────────────────────────────────────────────────────
        POSTINGS = [
            {
                "posting_id": "JP-2026-0001",
                "role": "Senior Mathematics Teacher",
                "department": "Academic Department",
                "type": "Full-time",
                "category": "Academic Positions",
                "location": "Guwahati, Assam",
                "description": "We are looking for an experienced Mathematics teacher to join our secondary school team.",
                "qualifications": ["Master's degree in Mathematics", "B.Ed or equivalent", "Experience in CBSE curriculum"],
                "experience": "3–5 yrs",
                "salary_range": "₹40K–₹60K",
                "channel": "External",
                "status": "Published",
                "deadline": "July 15, 2026",
            },
            {
                "posting_id": "JP-2026-0002",
                "role": "Office Coordinator",
                "department": "Administration",
                "type": "Full-time",
                "category": "Administrative Positions",
                "location": "Guwahati, Assam",
                "description": "Manage day-to-day office operations and coordinate communications.",
                "qualifications": ["Graduate", "Proficiency in MS Office", "Strong communication skills"],
                "experience": "2–4 yrs",
                "salary_range": "₹25K–₹35K",
                "channel": "Internal",
                "status": "Published",
                "deadline": "June 30, 2026",
            },
            {
                "posting_id": "JP-2026-0003",
                "role": "Hindi Teacher",
                "department": "Languages",
                "type": "Full-time",
                "category": "Academic Positions",
                "location": "Guwahati, Assam",
                "description": "Teach Hindi language and literature to secondary students.",
                "qualifications": ["M.A Hindi", "B.Ed", "3+ years teaching experience"],
                "experience": "3–5 yrs",
                "salary_range": "₹38K–₹55K",
                "channel": "External",
                "status": "Unpublished",
                "deadline": "—",
            },
        ]
        for p in POSTINGS:
            category_name = p.pop("category")
            p["category"] = category_map[category_name]
            JobPosting.objects.get_or_create(posting_id=p["posting_id"], defaults=p)
        self.stdout.write(f"  [OK] {len(POSTINGS)} job postings seeded")

        # ── Candidate user ─────────────────────────────────────────────────────
        candidate, created = User.objects.get_or_create(
            email="priya.sharma@email.com",
            defaults={
                "username": "priya.sharma@email.com",
                "first_name": "Priya",
                "last_name": "Sharma",
                "phone": "9876543210",
                "role": "candidate",
            }
        )
        if created:
            candidate.set_password("Priya@123")
            candidate.save()

        # Seed profile for Priya Sharma
        CandidateProfile.objects.get_or_create(
            user=candidate,
            defaults={
                "current_location": "Guwahati, Assam",
                "educational_qualification": "Master's",
                "degree_name": "M.Sc in Mathematics",
                "years_of_experience": "3-5",
                "roles_interested": ["Senior Mathematics Teacher"],
                "skills": ["Curriculum Development", "Classroom Management"],
                "salary_expectation": "50,000",
                "resume": "resumes/priya_sharma_resume.pdf"
            }
        )

        # Seed general application (profile) for Priya Sharma
        GeneralApplication.objects.get_or_create(
            candidate=candidate,
            defaults={
                "app_id": "GAPP-2026-0001",
                "preferred_role": "Senior Mathematics Teacher",
                "preferred_dept": "Academic Department",
                "experience": "3–5 yrs",
                "qualification": "Master's (M.Sc in Mathematics)",
                "status": "Applied"
            }
        )

        self.stdout.write("\n[DONE] Database seeded successfully!")
        self.stdout.write("\nTest credentials:")
        self.stdout.write("  HR Admin:  hr@southpoint.edu / Admin@123")
        self.stdout.write("  Panelist:  panelist@southpoint.edu / Panel@123")
        self.stdout.write("  Candidate: priya.sharma@email.com / Priya@123")
        self.stdout.write("\nRun: python manage.py runserver")
