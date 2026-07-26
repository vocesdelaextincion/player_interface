# Directive: player_interface

## Project
Voces de la Extinción — player_interface

## Purpose
The people in charge of this project, often goes to museums and show the recordings to the public. This is being showed through an old app (local wordpress) that looks horrible and very glitchy. We are building the new version of it. A modern, good looking, non-glitchy, animated music player.

## Scope
There's no relation from this project to the other (backed, aws_backed, etc) other than "show the same recordings". But I want to be clear with this, the app will be displayed in a very old computer, so we're gonna place the recordings directly in the project folder. No backend (or even internet) connection at all. Let's not put an eye in the other projects.

## Requirements
An fullscreen, no-scroll app that shows a couple of states (idle, active, admin, etc). Each state will perform a different action. Idle: Probably some fancy and beautiful animation. Active: The main state, here the users will be able to listen the recordings in a modern player. Admin: A screen where admins can perform admin actions (close the app, etc.), this screen will be accessed by entering a password after hitting an specific key (f4?)

## Tech Stack
I was thinking to keep it simple: React, css modules. But maybe we can use Electron for this, so the result is an app that can be opened without a browser. wdyt? Any thought? Am I missing something?

## Notes
The app will be running for a long time, let's make sure we don't create something that conflicts with that. We'll be making our big effort in animations, I think that's the difference from an old app to a modern one, let's keep that in mind and install some library for that. Keep atommic commits. Create good and short documentation about the project. Do not overexplain, do not overcomment, do not sign the commits with your name.
