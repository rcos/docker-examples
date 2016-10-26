# Example 01: Running Ubuntu in a Container

Ubuntu is one of the most widely used operating systems, as a result, it can
run most applications intended for linux environments.

In this exercise, we're going to run an Ubuntu container and install the popular
"cowsay" program. By doing so, we'll show that standard installation tools and
workflows can be used within a docker container.

## Running the Ubuntu container

To run a docker container, we use `docker run`.

The full syntax for `docker run` is `docker run [OPTIONS] IMAGE [COMMAND] [ARG...]`.

Docker has many options that can be passed to a container. Some options, `-v`
will allow the user to mount a directory on the *host* machine in the container.
`-e` allow for environment variables to be passed into the container, this is
useful when you'd like to set the URI for a database.

In order to interact with the docker container from the command line, we'll need
to use `-it`. The first flag, `-i`, states that the docker container should
allow for interaction. The second flag, `-t`, tells the docker container to
"allocate a pseudo-TTY", which essentially means that you would like a terminal
in the docker container. These options together allow for interaction with the
container from the command line.

For our image, we'll be using `ubuntu`. Specific versions or *tags* of ubuntu
can be referenced using a colon. For example, if you would like ubuntu 14.04,
you can use `ubuntu:14.04`.

For command line usage where we'd like a shell, the `COMMAND` is our preferred
shell. In the case of Ubuntu, the `bash` shell will work fine. If you're not
experimenting with a docker container from a terminal, this command will
probably be the main executable of your application.

Putting all these together, our terminal command to start an interactive ubuntu terminal becomes...

`docker run -it ubuntu bash`

Running the previous command should have placed you in an ubuntu terminal. Feel free to explore the container, you can't do any damage outside of the container so you can do fun things like delete `/bin` or `/usr` (if you break your container, simple exit the container with Ctrl-D and start over).

## Installing Vim

To install vim, you can use the standard ubuntu installation manager, `apt`.

Begin by updating the sources in apt via `apt update`.

Next, install vim via `apt install vim`.

You can now execute vim! Try placing a test file in the `/root` directory.

## Installing Cowsay

We can now install cowsay. Our sources are already updated, so we can skip directly to the installation step and run `apt install cowsay`.

You may run `cowsay` but you'll find that the command isn't found. Cowsay is classified as a game in Ubuntu, as a result it's not picked up on the ubuntu server's $PATH without logging out and logging back in. We can mitigate this (i.e. avoid logging out and logging back in) by running the switch user command, also known as `su`.

Now play with cowsay to your heart's content, e.g. `cowsay "moo!"`
