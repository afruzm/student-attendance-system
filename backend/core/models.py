from django.db import models

class Department(models.Model):
    name = models.CharField(max_length=255)
    head_name = models.CharField(max_length=255, blank=True)
    institute = models.CharField(max_length=255, blank=True)
    def __str__(self): return self.name

class StudyGroup(models.Model):
    number = models.CharField(max_length=32, unique=True)
    speciality = models.CharField(max_length=64, blank=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='groups')
    curator = models.CharField(max_length=255, blank=True)
    def __str__(self): return self.number

class Person(models.Model):
    ROLE_CHOICES = [('student','Студент'),('teacher','Преподаватель'),('dean','Деканат')]
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    login = models.CharField(max_length=80, unique=True)
    password = models.CharField(max_length=80, default='1234')
    group = models.ForeignKey(StudyGroup, null=True, blank=True, on_delete=models.SET_NULL, related_name='students')
    department = models.ForeignKey(Department, null=True, blank=True, on_delete=models.SET_NULL, related_name='people')
    position = models.CharField(max_length=120, blank=True)
    subgroup = models.CharField(max_length=10, blank=True, help_text='Учебная подгруппа: 1 или 2')
    is_monitor = models.BooleanField(default=False)
    def __str__(self): return self.full_name

class Subject(models.Model):
    title = models.CharField(max_length=255, unique=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='subjects')
    def __str__(self): return self.title

class Lesson(models.Model):
    WEEK_CHOICES = [('v','Верхняя'),('n','Нижняя'),('both','Каждую неделю')]
    DAY_CHOICES = [(0,'Понедельник'),(1,'Вторник'),(2,'Среда'),(3,'Четверг'),(4,'Пятница'),(5,'Суббота')]
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='lessons')
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name='lessons')
    teacher = models.ForeignKey(Person, null=True, blank=True, on_delete=models.SET_NULL, related_name='lessons')
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    time = models.CharField(max_length=20)
    week_type = models.CharField(max_length=10, choices=WEEK_CHOICES)
    building = models.CharField(max_length=80, blank=True)
    room = models.CharField(max_length=80, blank=True)
    lesson_type = models.CharField(max_length=40, blank=True)
    subgroup = models.CharField(max_length=40, blank=True)
    note = models.CharField(max_length=255, blank=True)
    def __str__(self): return f'{self.subject} {self.time}'

class Attendance(models.Model):
    STATUS_CHOICES = [('present','+'),('absent','-'),('late','Опоздание')]
    student = models.ForeignKey(Person, on_delete=models.CASCADE, related_name='attendance')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='attendance')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    reason = models.CharField(max_length=255, blank=True)
    marked_by = models.ForeignKey(Person, null=True, blank=True, on_delete=models.SET_NULL, related_name='marked_attendance')
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        unique_together = ('student','lesson','date')
    def __str__(self): return f'{self.student} {self.date} {self.status}'
