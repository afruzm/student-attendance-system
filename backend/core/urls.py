from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
router = DefaultRouter()
router.register('departments', DepartmentViewSet, basename='departments')
router.register('groups', StudyGroupViewSet, basename='groups')
router.register('people', PersonViewSet, basename='people')
router.register('subjects', SubjectViewSet, basename='subjects')
router.register('lessons', LessonViewSet, basename='lessons')
router.register('attendance', AttendanceViewSet, basename='attendance')
urlpatterns = [
    path('', include(router.urls)), path('login/', login), path('today-lessons/', today_lessons), path('mark-attendance/', mark_attendance),
    path('stats/', stats), path('analytics/', analytics), path('export-report-xlsx/', export_report_xlsx), path('semester-matrix/', semester_matrix), path('student-subject-summary/<int:pk>/', student_subject_summary), path('student-attendance/<int:pk>/', student_attendance), path('semester-report/', semester_report), path('export-report/', export_report),
]
