const loadXml = document.getElementById("loadXml");
const URI = document.getElementById("Uri");
var activeDay = "";
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

loadXml.addEventListener("click", () => {
  loadDoc();
});

function loadDoc() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        const timerStart = performance.now();
        findWeek(this);
        findEvents(this);
        const timerEnd = performance.now();
        document.getElementById(
          "time-elapsed"
        ).innerHTML = `Application's running time: ${timerEnd - timerStart} ms`;
      } else {
        console.error("Server error:", this.status);
      }
    }
  };
  xhttp.open("GET", URI.value, true);
  xhttp.send();
}

function findEvents(xmlFile) {
  var file = xmlFile.responseXML;
  var items = file.getElementsByTagName("item");
  const events = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    const title = item.getElementsByTagName("title")[0].textContent;
    const startUnix = parseInt(
      item.getElementsByTagName("start")[0].textContent
    );
    const endUnix = parseInt(item.getElementsByTagName("end")[0].textContent);

    const eventDateStart = new Date(startUnix * 1000);
    const eventDateEnd = new Date(endUnix * 1000);

    const eventDayStart = structureWeekdays(eventDateStart);
    const eventDayEnd = structureWeekdays(eventDateEnd);

    const eventMinuteStart =
      eventDateStart.getHours() * 60 + eventDateStart.getMinutes();
    var eventMinuteEnd =
      eventDateEnd.getHours() * 60 + eventDateEnd.getMinutes();

    if (eventDayStart != eventDayEnd) {
      eventMinuteEnd += 24 * 60;
    }

    const eventLength = eventMinuteEnd - eventMinuteStart;
    const timeString = `<div>${formatTime(eventDateStart)}-${formatTime(
      eventDateEnd
    )}<div>`;

    events.push({
      title: title,
      subtitle: timeString,
      eventStart: eventMinuteStart,
      eventEnd: eventMinuteEnd,
      eventLength: eventLength,
      eventDay: eventDayStart,
      eventDayEnd: eventDayEnd,
      eventID: Math.floor(Math.random() * 100),
      eventWidth: 150,
    });
  }

  events.forEach((event) => {
    if (event.eventDay == event.eventDayEnd) {
      const eventSlot = document.querySelectorAll(
        `[data-day="${event.eventDay}"][data-time="${event.eventStart}"]`)[0];
      const eventCell = document.createElement("div");
      eventCell.classList.add("event");
      eventCell.id = event.eventID;
      eventCell.style.height = `${event.eventLength}px`;
      eventCell.innerHTML = `<div>${event.title}</div>`;
      eventCell.innerHTML += event.subtitle;
      eventCell.style.width = `${event.eventWidth}px`;
      eventSlot.appendChild(eventCell);
    } else {
      const leftoverMinutes = event.eventStart + event.eventLength - 48 * 30;
      const eventSlotStart = document.querySelectorAll(
        `[data-day="${event.eventDay}"][data-time="${event.eventStart}"]`)[0];
      const eventSlotEnd = document.querySelectorAll(
        `[data-day="${event.eventDayEnd}"][data-time="0"]`)[0];

      const eventCell1 = document.createElement("div");
      eventCell1.classList.add("event");
      eventCell1.id = event.eventID;
      eventCell1.style.height = `${event.eventLength - leftoverMinutes}px`;
      eventCell1.innerHTML = `<div>${event.title}</div>`;
      eventCell1.innerHTML += event.subtitle;
      eventCell1.style.width = `${event.eventWidth}px`;
      eventSlotStart.appendChild(eventCell1);

      const eventCell2 = document.createElement("div");
      eventCell2.classList.add("event");
      eventCell2.id = event.eventID;
      eventCell2.style.height = `${leftoverMinutes}px`;
      eventCell2.innerHTML = `<div>${event.title}</div>`;
      eventCell2.innerHTML += event.subtitle;
      eventCell2.style.width = `${event.eventWidth}px`;
      eventSlotEnd.appendChild(eventCell2);
    }
  });

  var overlapEvents = [];

  for (let i = 0; i < events.length; i++) {
    for (let x = i + 1; x < events.length; x++) {
      if (
        events[i].eventDay == events[x].eventDay &&
        events[i].eventEnd > events[x].eventStart
      ) {
        overlapEvents.push(events[i], events[x]);
      }
    }
  }

  if (overlapEvents.length > 1) {
    const sharedWidth = 150 / overlapEvents.length - 4;

    overlapEvents.forEach((e, index) => {
      const el = document.getElementById(e.eventID);
      el.style.width = sharedWidth + "px";
      if (index > 0) {
        el.style.marginLeft = sharedWidth * index + 4 + "px";
      }
    });
  }
}

function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function findWeek(xmlFile) {
  var file = xmlFile.responseXML;
  var UnixTime = file.getElementsByTagName("dayinweek")[0].textContent;
  const weekDays = [];

  const currentDate = new Date(UnixTime * 1000);
  const dayOfWeek = currentDate.getDay();
  activeDay = structureWeekdays(currentDate);

  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDays.push(structureWeekdays(d));
  }

  generateCalendar(weekDays);
}

function structureWeekdays(day) {
  return `${days[day.getDay()]} ${day.getDate()} ${months[day.getMonth()]}`;
}

function generateCalendar(days) {
  const calendarContainer = document.getElementById("calendar");
  calendarContainer.innerHTML = "";

  const weekdaysHeader = document.createElement("div");
  weekdaysHeader.classList.add("row", "header");

  const emptyCell = document.createElement("div");
  emptyCell.classList.add("time-cell", "header-cell");
  weekdaysHeader.appendChild(emptyCell);

  days.forEach((day) => {
    const dayCell = document.createElement("div");
    dayCell.classList.add("day-cell", "header-cell");
    if (day == activeDay) {
      dayCell.classList.add("active-day");
    }
    dayCell.textContent = day;
    weekdaysHeader.appendChild(dayCell);
  });

  calendarContainer.appendChild(weekdaysHeader);

  for (let i = 0; i < 48; i++) {
    const row = document.createElement("div");
    row.className = "row";
    var timeLabel = i * 30;

    const timeCell = document.createElement("div");
    timeCell.className = "time-cell";

    if (timeLabel % 60 == 0) {
      if (timeLabel / 60 < 10) {
        timeCell.textContent = "0" + timeLabel / 60 + ":00";
      } else {
        timeCell.textContent = timeLabel / 60 + ":00";
      }
    } else {
      timeCell.textContent = "";
    }

    row.appendChild(timeCell);

    days.forEach((day) => {
      const slot = document.createElement("div");
      slot.className = "day-cell";
      slot.dataset.day = day;
      slot.dataset.time = timeLabel;
      row.appendChild(slot);
    });

    calendar.appendChild(row);
  }
}
