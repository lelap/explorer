from django.db import models
from polymorphic import PolymorphicModel
from .mixins import CanBeDescribed, CanHaveWebsite, Titled

from .years import YEAR_CHOICES

SEMESTER_CHOICES = (
        ('fa', 'Fall'),
        ('sp', 'Spring'),
        ('ia', 'IAP'),
        ('sm', 'Summer'),
        )

LEVEL_CHOICES = (
        ('u', 'Undergraduate'),
        ('g', 'Graduate'),
        ('h', 'H-Level Graduate'),
        )


class Semester(models.Model):
    """A single academic semester at MIT
    """
    season = models.CharField(max_length=4, choices=SEMESTER_CHOICES)
    year = models.CharField(max_length=4, choices=YEAR_CHOICES, default=2014)
    class Meta:
        app_label = 'mit'
    def __unicode__(self):
        return "%s %s" % (self.year, self.season)

class Subject(PolymorphicModel, Titled, CanBeDescribed):
    """An ongoing subject at MIT
    """
    course_codes = models.CharField(max_length=50)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='u')
    class Meta:
        app_label = 'mit'
    def __unicode__(self):
        return self.course_codes + ": " + self.title

class Course(PolymorphicModel, CanBeDescribed, CanHaveWebsite):
    """A specific version of a class offered during some specific semesters at MIT,
        taught by specific people, and covering specific topics and places.
        Any course with a unique description should be recorded as a separate
        course. Only identical courses should have the multiple semesters
        listed.
    """
    subject = models.ForeignKey('Subject')
    title = models.CharField(max_length=250, null=True, blank=True)
    instructors = models.ManyToManyField('Person')
    semesters = models.ManyToManyField('Semester')
    topics = models.ManyToManyField('Topic', null=True, blank=True)
    places_of_study = models.ManyToManyField('Location', null=True, blank=True)
    class Meta:
        app_label = 'mit'
    def __unicode__(self):
        return ", ".join([self.subject.course_codes, self.title])

