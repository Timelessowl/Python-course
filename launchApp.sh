#!/bin/bash

open_tmux_window() {
    tmux new-window -n "$1" "$2"
}

open_tmux_window "Backend" "cd backend; source ../venv/bin/activate; python3 manage.py makemigrations; python3 manage.py migrate; python3 manage.py runserver"
open_tmux_window "Celery Worker" "cd backend; source ../venv/bin/activate; celery -A backend worker --loglevel=INFO"
open_tmux_window "Celery Beat" "cd backend; source ../venv/bin/activate; celery -A backend beat --loglevel=INFO"
open_tmux_window "Frontend" "cd frontend; npm start"

tmux attach-session -d