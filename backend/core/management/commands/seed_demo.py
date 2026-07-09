from datetime import date, timedelta
from django.core.management.base import BaseCommand
from core.models import *

STUDENTS = '''Student 01
Student 02
Student 03
Student 04
Student 05
Student 06
Student 07
Student 08
Student 09
Student 10'''.split('\n')

STUDENT_SUBGROUPS = {name: '1' if i % 2 else '2' for i, name in enumerate(STUDENTS, 1)}

TEACHERS = [
    ('Teacher 01', 'Professor'),
    ('Teacher 02', 'Associate Professor'),
    ('Teacher 03', 'Lecturer'),
]
SUBJECTS = ['Web-программирование','Эффективность информационных систем','Моделирование социально-экономических систем']

def slug(i, prefix): return f'{prefix}{i}'

def lesson_subgroup_number(lesson):
    if 'гр.1' in lesson.subgroup: return '1'
    if 'гр.2' in lesson.subgroup: return '2'
    return ''

class Command(BaseCommand):
    help = 'Seed demo data for attendance app'

    def handle(self, *args, **kwargs):
        Attendance.objects.all().delete()
        Lesson.objects.all().delete()
        Subject.objects.all().delete()
        Person.objects.all().delete()
        StudyGroup.objects.all().delete()
        Department.objects.all().delete()

        dep = Department.objects.create(
            name='Department of Applied Informatics',
            head_name='Head of Department',
            institute='Demo University'
        )

        econ_dep = Department.objects.create(
            name='Department of Economics',
            head_name='Head of Economics Department',
            institute='Demo University'
        )

        law_dep = Department.objects.create(
            name='Department of Management',
            head_name='Head of Management Department',
            institute='Demo University'
        )

        dean_dep = Department.objects.create(
            name='Dean Office',
            head_name='Dean Office Manager',
            institute='Demo University'
        )

        group = StudyGroup.objects.create(
            number='PI-2026',
            speciality='09.03.03',
            department=dep,
            curator='Demo Curator'
        )

        StudyGroup.objects.create(
            number='PI-2025',
            speciality='09.03.03',
            department=dep,
            curator='Demo Curator'
        )

        StudyGroup.objects.create(
            number='EC-2026',
            speciality='38.03.01',
            department=econ_dep,
            curator='Demo Curator'
        )

        StudyGroup.objects.create(
            number='MG-2026',
            speciality='38.03.02',
            department=law_dep,
            curator='Demo Curator'
        )

        people = {}

        for i, name in enumerate(STUDENTS, 1):
            people[name] = Person.objects.create(
                full_name=name,
                role='student',
                login=slug(i, 's'),
                password='1234',
                group=group,
                department=dep,
                subgroup=STUDENT_SUBGROUPS.get(name, ''),
                is_monitor=(i == 1)
            )

        teacher_deps = {
            'Teacher 01': dep,
            'Teacher 02': dep,
            'Teacher 03': dep,
        }

        for i, (name, pos) in enumerate(TEACHERS, 1):
            people[name] = Person.objects.create(
                full_name=name,
                role='teacher',
                login=slug(i, 't'),
                password='1234',
                department=teacher_deps.get(name, dep),
                position=pos
            )

        Person.objects.create(
            full_name='Dean User',
            role='dean',
            login='dean',
            password='1234',
            department=dean_dep,
            position='Dean Office Specialist'
        )

        subj = {title: Subject.objects.create(title=title, department=dep) for title in SUBJECTS}

        teacher_1 = people['Teacher 01']
        teacher_2 = people['Teacher 02']
        teacher_3 = people['Teacher 03']

        data = [
            (1, '8:00', 'v', 'Web Development', teacher_1, 'Building A', '101', 'lab', 'group 1'),
            (1, '9:40', 'both', 'Web Development', teacher_1, 'Building A', '101', 'lab', 'group 1'),
            (1, '11:50', 'both', 'Information Systems Efficiency', teacher_2, 'Building A', '102', 'lab', 'group 2'),

            (2, '8:00', 'v', 'Socio-Economic Systems Modeling', teacher_3, 'Building B', '201', 'lecture', ''),
            (2, '9:40', 'both', 'Web Development', teacher_1, 'Building A', '101', 'lab', 'group 2'),
            (2, '11:50', 'both', 'Socio-Economic Systems Modeling', teacher_3, 'Building B', '202', 'lab', 'group 1'),
            (2, '13:30', 'both', 'Web Development', teacher_1, 'Building A', '101', 'lab', 'group 2'),

            (3, '9:40', 'both', 'Socio-Economic Systems Modeling', teacher_3, 'Building B', '201', 'lecture', ''),
            (3, '11:50', 'both', 'Information Systems Efficiency', teacher_2, 'Building A', '102', 'lab', 'group 1'),
            (3, '13:30', 'v', 'Information Systems Efficiency', teacher_2, 'Building A', '102', 'lab', 'group 1'),

            (4, '15:40', 'v', 'Information Systems Efficiency', teacher_2, 'Building C', '301', 'lecture', ''),
            (4, '17:20', 'v', 'Information Systems Efficiency', teacher_2, 'Building C', '301', 'lecture', ''),

            (5, '8:00', 'v', 'Information Systems Efficiency', teacher_2, 'Building C', '302', 'lecture', ''),
            (5, '9:40', 'v', 'Information Systems Efficiency', teacher_2, 'Building C', '302', 'lecture', ''),
        ]

        lessons = []

        for day, time, week, title, teacher, building, room, lesson_type, subgroup in data:
            lessons.append(
                Lesson.objects.create(
                    day_of_week=day,
                    time=time,
                    week_type=week,
                    subject=subj[title],
                    teacher=teacher,
                    group=group,
                    building=building,
                    room=room,
                    lesson_type=lesson_type,
                    subgroup=subgroup
                )
            )

        start = date(2026, 2, 10)
        students = list(Person.objects.filter(role='student', group=group))

        for offset in range(0, 35, 7):
            current_date = start + timedelta(days=offset)

            for lesson in lessons:
                if lesson.day_of_week == current_date.weekday():
                    lesson_sg = lesson_subgroup_number(lesson)
                    eligible = [
                        student for student in students
                        if not lesson_sg or student.subgroup == lesson_sg
                    ]

                    for idx, student in enumerate(eligible):
                        status = 'absent' if (idx + offset + lesson.id) % 7 == 0 else 'present'

                        Attendance.objects.create(
                            student=student,
                            lesson=lesson,
                            date=current_date,
                            status=status,
                            marked_by=lesson.teacher
                        )

        self.stdout.write(
            self.style.SUCCESS('Demo data created. Logins: dean/1234, t1/1234, s1/1234')
        )
