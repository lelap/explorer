from django.db import models
from polymorphic import PolymorphicModel

from .mixins import (Titled, DateAware, CanBeDescribed, CanHaveWebsite)

class Work(PolymorphicModel, Titled, CanBeDescribed, DateAware, CanHaveWebsite):
    """The most generic category of an item of work done by faculty
    """
    authors = models.ManyToManyField('Person')
    topics = models.ManyToManyField('Topic', null=True, blank=True)
    locations = models.ManyToManyField('Location', null=True, blank=True)
    class Meta:
        app_label = "mit"

class Project(Work):
    """A generic project done by faculty
    """
    partners = models.TextField(null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    class Meta:
        app_label = "mit"
