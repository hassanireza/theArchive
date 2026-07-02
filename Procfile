release: python manage.py migrate --noinput
web: gunicorn collaboration_app.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --threads 2 --timeout 60
