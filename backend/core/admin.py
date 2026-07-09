from django.contrib import admin
from .models import *
admin.site.register([Department, StudyGroup, Person, Subject, Lesson, Attendance])
