# NovaPlanner

Frutiger Aero–inspired task manager built to make planning feel calm, clean, and fun.

## Overview
NovaPlanner is a modern organizer with a UI inspired by the **Frutiger Aero** aesthetic: glassy panels, soft gradients, and crisp layouts—paired with practical productivity features. In an era when corporate minimalism is the go-to for an application interface, NovaPlanner is supposed to be a refreshing and nostalgic sight of old aesthetics.
Built with a **React** frontend and an **ASP.NET Core** backend, NovaPlanner integrates reactive data flows so UI state updates feel instant, consistent, and responsive. The project also includes a MongoDB database layer and an AI assistant integrated via **Semantic Kernel**, supporting a more adaptive and personalized experience.

## Features
### Task types
- **Dailies** — recurring everyday tasks you want to complete regularly
- **To‑Do** — one-time tasks you can finish and check off
- **Habits** — track behaviors with a counter you can **increase / decrease** each time you do (or undo) the habit
- **Goals** — bigger objectives broken into **checkpoints** (for progress tracking)

### Core actions
- **Add** tasks
- **Edit** tasks
- **Delete** tasks
- **Mark as done**
- **Filter** tasks to find what you need faster

## Project focus on Reactive Programming

This project highlights the benefits of **reactive programming** in modern web development, emphasizing how reactive data flows can help build a system that is:

- **Fluid** (updates are reflected immediately in the UI)
- **Interactive** (state changes propagate naturally)
- **Scalable** (cleaner flow of data between components/services)
- **User-friendly** (an interface that adapts to changes in real time)

## Tech Stack

- **Frontend:** React (JavaScript) + Vite
- **Backend:** ASP.NET Core (C#)
- **Database:** MongoDB
- **AI Assistant:** integrated using **Semantic Kernel**
- **Styling:** CSS

## Notes on Quality & Future Improvements

NovaPlanner is functional end-to-end, but there is room for improvement on functionality and performance:

- **Refactoring opportunities** to reduce moderate cyclomatic complexity
- **Automated tests** to speed up debugging and support safer iteration
- **UX improvements**
- **Security enhancements** such as adding **OAuth**
- **Deployment** (currently intended for local usage via `localhost`)

### Made as a practical example for my Bachelor's thesis.
