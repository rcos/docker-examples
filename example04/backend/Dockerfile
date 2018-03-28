# Comments in Dockerfiles
FROM python:3.5

# Update and install dependencies
RUN apt-get update
RUN pip install Flask

# Set environment variables
ENV FLASK_APP=hello.py
ENV FLASK_DEBUG=1

# Expose the application's port
EXPOSE 5000

# Add code
ADD . /usr/src/app

# Set the working directory
WORKDIR /usr/src/app

# Run the application
CMD ["flask", "run", "--host=0.0.0.0"]
