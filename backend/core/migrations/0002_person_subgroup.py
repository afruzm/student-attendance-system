# Generated manually for demo project
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='person',
            name='subgroup',
            field=models.CharField(blank=True, help_text='Учебная подгруппа: 1 или 2', max_length=10),
        ),
    ]
