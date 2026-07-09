from datetime import date, timedelta
from django.core.management.base import BaseCommand
from core.models import *

STUDENTS = '''Бакеева Алсу Ильясовна
Бекмурадов Сапармурат
Богатырев Александр Сергеевич
Галиева Малика Азатовна
Гатауллин Эмиль Джамилевич
Горбунов Антон Сергеевич
Горшонков Вадим Евгеньевич
Гура Назар Вадимович
Давлетова Алина Даниловна
Демиданова Александра Дмитриевна
Ермолаева Полина Ильинична
Карамова Энже Рамилевна
Колесников Николай Иванович
Кучугулов Кирилл Романович
Мастийева Афруз Фархад Кызы
Миронова Елизавета Максимовна
Нургалиев Самат Маратович
Подгорбунская Ольга Павловна
Сафин Аяз Айратович
Сулейманов Артур Ильмирович
Усманова Лилия Илшатовна
Хазипов Самат Ильмирович
Хаков Айнур Русланович
Чалкин Максим Валерьевич
Шакирова Аделя Рафисовна
Шихова Арина Денисовна
Яруллин Рамзиль Расимович'''.split('\n')

STUDENT_SUBGROUPS = {
    'Бакеева Алсу Ильясовна':'1', 'Бекмурадов Сапармурат':'2', 'Богатырев Александр Сергеевич':'1',
    'Галиева Малика Азатовна':'1', 'Гатауллин Эмиль Джамилевич':'2', 'Горбунов Антон Сергеевич':'2',
    'Горшонков Вадим Евгеньевич':'2', 'Гура Назар Вадимович':'2', 'Давлетова Алина Даниловна':'1',
    'Демиданова Александра Дмитриевна':'2', 'Ермолаева Полина Ильинична':'1', 'Карамова Энже Рамилевна':'1',
    'Колесников Николай Иванович':'2', 'Кучугулов Кирилл Романович':'1', 'Мастийева Афруз Фархад Кызы':'1',
    'Миронова Елизавета Максимовна':'1', 'Нургалиев Самат Маратович':'2', 'Подгорбунская Ольга Павловна':'1',
    'Сафин Аяз Айратович':'1', 'Сулейманов Артур Ильмирович':'2', 'Усманова Лилия Илшатовна':'1',
    'Хазипов Самат Ильмирович':'2', 'Хаков Айнур Русланович':'1', 'Чалкин Максим Валерьевич':'1',
    'Шакирова Аделя Рафисовна':'1', 'Шихова Арина Денисовна':'1', 'Яруллин Рамзиль Расимович':'2',
}

TEACHERS = [
('Ишмурадова Изида Илдаровна','Заведующая кафедрой'),('Исавнин Алексей Геннадьевич','Профессор'),('Розенцвайг Александр Куртович','Преподаватель'),('Лысанов Денис Михайлович','Доцент'),('Файзуллина Айгуль Гинатулловна','Преподаватель'),('Мансурова Татьяна Геннадьевна','Доцент')]
SUBJECTS = ['Web-программирование','Эффективность информационных систем','Моделирование социально-экономических систем']

def slug(i, prefix): return f'{prefix}{i}'

def lesson_subgroup_number(lesson):
    if 'гр.1' in lesson.subgroup: return '1'
    if 'гр.2' in lesson.subgroup: return '2'
    return ''

class Command(BaseCommand):
    help = 'Seed demo data for attendance app'
    def handle(self, *args, **kwargs):
        Attendance.objects.all().delete(); Lesson.objects.all().delete(); Subject.objects.all().delete(); Person.objects.all().delete(); StudyGroup.objects.all().delete(); Department.objects.all().delete()
        dep = Department.objects.create(name='Кафедра бизнес-информатики и математических методов в экономике', head_name='Ишмурадова Изида Илдаровна', institute='Набережночелнинский институт КФУ')
        Department.objects.create(name='Кафедра социально-гуманитарных наук', head_name='Петров Петр Петрович', institute='Набережночелнинский институт КФУ')
        Department.objects.create(name='Кафедра юридических дисциплин', head_name='Сидоров Сергей Сергеевич', institute='Набережночелнинский институт КФУ')
        Department.objects.create(name='Кафедра таможенного дела', head_name='Кузнецова Ольга Викторовна', institute='Набережночелнинский институт КФУ')
        Department.objects.create(name='Кафедра иностранных языков', head_name='Иванова Анна Сергеевна', institute='Набережночелнинский институт КФУ')
        Department.objects.create(name='Кафедра филологии', head_name='Смирнова Алина Алексеевна', institute='Набережночелнинский институт КФУ')
        econ_dep = Department.objects.create(name='Кафедра экономики предприятий и организаций', head_name='Васильев Владимир Владимирович', institute='Набережночелнинский институт КФУ')
        law_dep = Department.objects.create(name='Кафедра производственного менеджмента', head_name='Михайлов Михаил Михайлович', institute='Набережночелнинский институт КФУ')
        Department.objects.create(name='Кафедра физического воспитания и спорта', head_name='Алексеев Алексей Алексеевич', institute='Набережночелнинский институт КФУ')
        dean_dep = Department.objects.create(name='Деканат Высшей школы экономики и права', head_name='Батушева Татьяна Викторовна', institute='Набережночелнинский институт КФУ')
        group = StudyGroup.objects.create(number='4221133', speciality='09.03.03', department=dep, curator='Имамова Гульназ Марсиловна')
        StudyGroup.objects.create(number='4221134', speciality='09.03.03', department=dep, curator='Имамова Гульназ Марсиловна')
        StudyGroup.objects.create(number='4211201', speciality='38.03.01', department=econ_dep, curator='Батушева Татьяна Викторовна')
        StudyGroup.objects.create(number='4211402', speciality='40.03.01', department=law_dep, curator='Розенцвайг Александр Куртович')
        people = {}
        for i, name in enumerate(STUDENTS,1):
            people[name] = Person.objects.create(full_name=name, role='student', login=slug(i,'s'), password='1234', group=group, department=dep, subgroup=STUDENT_SUBGROUPS.get(name,''), is_monitor=('Мастийева' in name))
        teacher_deps = {
            'Ишмурадова Изида Илдаровна': dep,
            'Исавнин Алексей Геннадьевич': dep,
            'Лысанов Денис Михайлович': dep,
            'Мансурова Татьяна Геннадьевна': dep,
            'Файзуллина Айгуль Гинатулловна': econ_dep,
            'Розенцвайг Александр Куртович': law_dep,
        }
        for i, (name,pos) in enumerate(TEACHERS,1):
            people[name] = Person.objects.create(full_name=name, role='teacher', login=slug(i,'t'), password='1234', department=teacher_deps.get(name, dep), position=pos)
        Person.objects.create(full_name='Имамова Гульназ Марсиловна', role='dean', login='dean', password='1234', department=dean_dep, position='Специалист кафедры')
        Person.objects.create(full_name='Батушева Татьяна Викторовна', role='dean', login='dean2', password='1234', department=dean_dep, position='Деканат ВШЭиП')
        subj = {t: Subject.objects.create(title=t, department=dep) for t in SUBJECTS}
        lys = people['Лысанов Денис Михайлович']; isa = people['Исавнин Алексей Геннадьевич']; man = people['Мансурова Татьяна Геннадьевна']
        data = [
            (1,'8:00','v','Web-программирование',lys,'УЛК-1','310','лаб','гр.1'),(1,'8:00','n','Web-программирование',lys,'УЛК-1','310','лаб','гр.1'),
            (1,'9:40','both','Web-программирование',lys,'УЛК-1','310','лаб','гр.1'),(1,'11:50','both','Эффективность информационных систем',isa,'УЛК-1','311','лаб','гр.2'),
            (2,'8:00','v','Моделирование социально-экономических систем',man,'УЛК-1','404','лек',''),(2,'9:40','both','Web-программирование',lys,'УЛК-1','310','лаб','гр.2'),
            (2,'11:50','both','Моделирование социально-экономических систем',man,'УЛК-1','311','лаб','гр.1'),(2,'13:30','both','Web-программирование',lys,'УЛК-1','310','лаб','гр.2'),
            (2,'15:40','both','Web-программирование',lys,'УЛК-1','403','лек',''),(2,'17:20','n','Web-программирование',lys,'УЛК-1','403','лек',''),
            (3,'9:40','both','Моделирование социально-экономических систем',man,'УЛК-1','403','лек',''),(3,'11:50','both','Эффективность информационных систем',isa,'УЛК-1','311','лаб','гр.1'),
            (3,'13:30','v','Эффективность информационных систем',isa,'УЛК-1','311','лаб','гр.1'),(3,'13:30','n','Моделирование социально-экономических систем',man,'УЛК-1','318','лаб','гр.2'),
            (3,'15:40','both','Моделирование социально-экономических систем',man,'УЛК-1','318','лаб','гр.2'),
            (4,'15:40','v','Эффективность информационных систем',isa,'УЛК-1','403','лек',''),(4,'15:40','n','Эффективность информационных систем',isa,'УЛК-1','311','лаб','гр.1'),
            (4,'17:20','v','Эффективность информационных систем',isa,'УЛК-1','403','лек',''),(4,'17:20','n','Эффективность информационных систем',isa,'УЛК-1','311','лаб','гр.1'),
            (5,'8:00','v','Эффективность информационных систем',isa,'УЛК-1','401','лек',''),(5,'9:40','v','Эффективность информационных систем',isa,'УЛК-1','401','лек','')]
        lessons=[]
        for day,t,week,title,teacher,bld,room,ltype,subgroup in data:
            lessons.append(Lesson.objects.create(day_of_week=day,time=t,week_type=week,subject=subj[title],teacher=teacher,group=group,building=bld,room=room,lesson_type=ltype,subgroup=subgroup))
        # demo attendance for several semester dates
        start = date(2026,2,10)
        students = list(Person.objects.filter(role='student', group=group))
        for offset in range(0,35,7):
            d = start + timedelta(days=offset)
            for lesson in lessons:
                if lesson.day_of_week == d.weekday():
                    lesson_sg = lesson_subgroup_number(lesson)
                    eligible = [st for st in students if not lesson_sg or st.subgroup == lesson_sg]
                    for idx, st in enumerate(eligible):
                        status = 'absent' if (idx + offset + lesson.id) % 7 == 0 else 'present'
                        Attendance.objects.create(student=st, lesson=lesson, date=d, status=status, marked_by=lesson.teacher)
        self.stdout.write(self.style.SUCCESS('Demo data created. Logins: dean/1234, t1/1234, s1/1234'))
