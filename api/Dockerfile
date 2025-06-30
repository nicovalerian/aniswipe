# Use the official Python image as a base
FROM python:3.9-slim-buster

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code and model artifacts
COPY . .

# Expose the port that the Flask app will listen on
ENV PORT 5000
EXPOSE $PORT

# Command to run the application using Gunicorn
# Gunicorn is a production-ready WSGI HTTP Server for Python
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "main:app"]