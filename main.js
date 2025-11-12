const loadXml = document.getElementById("loadXml");
const URI = document.getElementById("Uri");
var activeDay = "";
var weekDays = [];
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
      if(weekDays.includes(event.eventDay) || weekDays.includes(event.eventDayEnd)){
        console.log('includes')
        if (event.eventDay == event.eventDayEnd) {
          const eventColumn = document.getElementById(event.eventDay);
          const eventCell = document.createElement("div");
          eventCell.classList.add("event");
          eventCell.id = event.eventID;
          eventCell.style.top = `${event.eventStart}px`
          eventCell.style.height = `${event.eventLength}px`;
          eventCell.innerHTML = `<div>${event.title}</div>`;
          eventCell.innerHTML += event.subtitle;
          eventCell.style.width = `${event.eventWidth}px`;
          eventColumn.appendChild(eventCell);
        }
        else if(event.eventDay != event.eventDayEnd) {
          console.log('not on the same day');
          if((weekDays.includes(event.eventDay))&&(weekDays.includes(event.eventDayEnd))){

            const leftoverMinutes = event.eventStart + event.eventLength - 48 * 30;
            const eventSlotStart = document.getElementById(event.eventDay);
            const eventSlotEnd = document.getElementById(event.eventDayEnd);

            const eventCell1 = document.createElement("div");
            eventCell1.classList.add("event");
            eventCell1.id = event.eventID;
            eventCell1.style.height = `${event.eventLength - leftoverMinutes}px`;
            eventCell1.style.top = `${event.eventStart}px`
            eventCell1.innerHTML = `<div>${event.title}</div>`;
            eventCell1.innerHTML += `<div>${event.subtitle}</div>`;
            eventCell1.style.width = `${event.eventWidth}px`;
            eventSlotStart.appendChild(eventCell1);

            const eventCell2 = document.createElement("div");
            eventCell2.classList.add("event");
            eventCell2.id = event.eventID;
            eventCell2.style.height = `${leftoverMinutes}px`;
            eventCell2.innerHTML = `<div>${event.title}</div>`;
            eventCell2.innerHTML += `<div>${event.subtitle}</div>`;
            eventCell2.style.width = `${event.eventWidth}px`;
            eventSlotEnd.appendChild(eventCell2); 
          }

          else if((weekDays.includes(event.eventDay))&&!(weekDays.includes(event.eventDayEnd))){

            console.log(event.eventDay,'is in the calendar but',event.eventDayEnd,'is not')
            const eventColumn = document.getElementById(event.eventDay);
            const eventCell = document.createElement("div");
            const leftoverMinutes = event.eventStart + event.eventLength - 48 * 30;
            eventCell.classList.add("event");
            eventCell.id = event.eventID;
            eventCell.style.top = `${event.eventStart}px`
            eventCell.style.height = `${event.eventLength - leftoverMinutes}px`;
            eventCell.innerHTML = `<div>${event.title}</div>`;
            eventCell.innerHTML += event.subtitle;
            eventCell.style.width = `${event.eventWidth}px`;
            eventColumn.appendChild(eventCell);
          }
          else if((weekDays.includes(event.eventDayEnd))&&!(weekDays.includes(event.eventDay))){
            console.log(event.eventDayEnd,'is in the calendar but',event.eventDay,'is not')
            const eventColumn = document.getElementById(event.eventDayEnd);
            const leftoverMinutes = event.eventStart + event.eventLength - 48 * 30;
            const eventCell = document.createElement("div");
            eventCell.classList.add("event");
            eventCell.id = event.eventID;
            eventCell.style.height = `${leftoverMinutes}px`;
            eventCell.innerHTML = `<div>${event.title}</div>`;
            eventCell.innerHTML += `<div>${event.subtitle}</div>`;
            eventCell.style.width = `${event.eventWidth}px`;
            eventColumn.appendChild(eventCell); 
          }

        } 
    }
    else console.error("Event outside of the week-range")
})


var overlapEvents = [];

/*   for (let i = 0; i < events.length; i++) {
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
  } */
}

function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function findWeek(xmlFile) {
  var file = xmlFile.responseXML;
  var UnixTime = file.getElementsByTagName("dayinweek")[0].textContent;

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
  console.log(weekDays,'weekdays');
}

function structureWeekdays(day) {
  return `${days[day.getDay()]} ${day.getDate()} ${months[day.getMonth()]}`;
}

function generateCalendar(days) {
  const calendarContainer = document.getElementById("calendar");
  calendarContainer.innerHTML = "";

  const timeColumn = document.createElement("div");
  timeColumn.classList.add("time-column");

  const emptyCell = document.createElement("div");
  emptyCell.className = "time-cell";

  timeColumn.appendChild(emptyCell);
  
  for (let i = 0; i < 48; i++) {
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

    timeColumn.appendChild(timeCell);
  }

  calendarContainer.appendChild(timeColumn);

  days.forEach((day) => {

    const dayColumn = document.createElement("div");
    dayColumn.className="day-column";

    const dayHeader = document.createElement("div");
    const dayCell = document.createElement("div");
    dayCell.className ="day-cell";
    dayCell.id = day;
    dayHeader.classList.add("header-cell");
    if (day == activeDay) {
      dayHeader.classList.add("active-day");
    }
    dayHeader.textContent = day;

    dayColumn.appendChild(dayHeader);
    dayColumn.appendChild(dayCell);
    calendarContainer.appendChild(dayColumn);
  });
}
