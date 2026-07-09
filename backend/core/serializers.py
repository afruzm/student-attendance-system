from rest_framework import serializers
from .models import *

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta: model = Department; fields = '__all__'
class StudyGroupSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    class Meta: model = StudyGroup; fields = '__all__'
class PersonSerializer(serializers.ModelSerializer):
    group_number = serializers.CharField(source='group.number', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    class Meta: model = Person; fields = '__all__'
class SubjectSerializer(serializers.ModelSerializer):
    class Meta: model = Subject; fields = '__all__'
class LessonSerializer(serializers.ModelSerializer):
    subject_title = serializers.CharField(source='subject.title', read_only=True)
    teacher_name = serializers.CharField(source='teacher.full_name', read_only=True)
    group_number = serializers.CharField(source='group.number', read_only=True)
    day_name = serializers.SerializerMethodField()
    def get_day_name(self,obj): return dict(Lesson.DAY_CHOICES).get(obj.day_of_week)
    class Meta: model = Lesson; fields = '__all__'
class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.full_name', read_only=True)
    subject_title = serializers.CharField(source='lesson.subject.title', read_only=True)
    teacher_name = serializers.CharField(source='lesson.teacher.full_name', read_only=True)
    group_number = serializers.CharField(source='lesson.group.number', read_only=True)
    lesson_time = serializers.CharField(source='lesson.time', read_only=True)
    lesson_type = serializers.CharField(source='lesson.lesson_type', read_only=True)
    class Meta: model = Attendance; fields = '__all__'
