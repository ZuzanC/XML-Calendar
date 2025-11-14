# 📅 Vanilla JS Calendar Weekview Solution

A simple, pure **Vanilla JavaScript** solution for displaying events from an **XML file** within a dynamic, week-based calendar interface — loaded seamlessly using **AJAX**.

---

## ✨ Features

- **XML Data Loading:** Events are fetched dynamically from an XML file using AJAX.  
- **Event Display:** Events are rendered directly into the interactive calendar grid.Each day is represented by a column.  
- **Monday Start:** The calendar always starts the week on **Monday**. 🗓️  
- **Current Day Highlight:** The current day is visually highlighted in **green** for easy tracking. ✅  
- **Overnight Event Handling:** Built to correctly display events that span across multiple days or overnight. 🌙
- **Out of scope Event Handling:** Built to correctly display events that start or end outside of the scope of the current week.  
- **Overlap Management:** Includes logic to handle and visually manage **overlapping events**. 🔄  

---

## 🛠️ Setup and Installation

To run this calendar locally, you only need to serve the files through a local server (since browsers block AJAX requests to local files).

### **Prerequisites**

- [Node.js](https://nodejs.org/) (for using `npx serve`)

### **Running the Solution**

- To run the solution, clone the repo and run in the terminal: **npx run serve**
- The repo comes with 3 example XML files, to test the solution.
- **test.xml** - a simple file with 2 events that don't overlap
- **overlap.xml** - a file with mutltiple events that overlap
- **overnight.xml** - a file with an overnight event
- **outofzone.xml** - a file with events that start or end outside of the scope of the week
- **xml.xml** - a file with many randomly generated events
- Enter the relative URI into the the input field and generate the calendar.
- For optimal performance refresh the page before loading another calendar.

<img width="891" height="673" alt="image" src="https://github.com/user-attachments/assets/b2d13d55-e24a-4c42-b665-24744b8b4b7e" />

