const loadXml = document.getElementById("loadXml");
const URI = document.getElementById("Uri");
let activeDay = "";
let weekDays = [];
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
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        const timerStart = performance.now();
        findWeek(this);
        findEvents(this);
        fixOverlapping();
        
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
  let file = xmlFile.responseXML;
  let items = file.getElementsByTagName("item");
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
    let eventMinuteEnd =
      eventDateEnd.getHours() * 60 + eventDateEnd.getMinutes();

    if (eventDayStart != eventDayEnd) {
      eventMinuteEnd += 24 * 60;
    }

    const eventLength = eventMinuteEnd - eventMinuteStart;
    const timeString = `${formatTime(eventDateStart)}-${formatTime(eventDateEnd)}`;

    events.push({
      title: title,
      subtitle: timeString,
      eventStart: eventMinuteStart,
      eventEnd: eventMinuteEnd,
      eventLength: eventLength,
      eventDay: eventDayStart,
      eventDayEnd: eventDayEnd,
      eventID: Math.floor(Math.random() * 100),
      eventWidth: 300,
    });
  }

    events.forEach((event) => {
      if(weekDays.includes(event.eventDay) || weekDays.includes(event.eventDayEnd)){
        if (event.eventDay == event.eventDayEnd) {
          const eventColumn = document.getElementById(event.eventDay);
          const eventCell = document.createElement("div");
          eventCell.classList.add("event");
          eventCell.id = event.eventID;
          eventCell.style.top = event.eventStart+'px'
          eventCell.style.height = event.eventLength +'px';
          eventCell.innerHTML = `<div>${event.title}</div>`;
          eventCell.innerHTML += `<div>${event.subtitle}</div>`;
          eventCell.style.width = event.eventWidth +'px';
          eventColumn.appendChild(eventCell);
        }
        else if(event.eventDay != event.eventDayEnd) {
          if((weekDays.includes(event.eventDay))&&(weekDays.includes(event.eventDayEnd))){

            const leftoverMinutes = event.eventStart + event.eventLength - 48 * 30;
            const eventSlotStart = document.getElementById(event.eventDay);
            const eventSlotEnd = document.getElementById(event.eventDayEnd);

            const eventCell1 = document.createElement("div");
            eventCell1.classList.add("event");
            eventCell1.id = event.eventID;
            eventCell1.style.height = event.eventLength - leftoverMinutes +'px';
            eventCell1.style.top = event.eventStart +'px';
            eventCell1.innerHTML = `<div>${event.title}</div>`;;
            eventCell1.innerHTML += `<div>${event.subtitle}</div>`;
            eventCell1.style.width = event.eventWidth +'px';
            eventSlotStart.appendChild(eventCell1);

            const eventCell2 = document.createElement("div");
            eventCell2.classList.add("event");
            eventCell2.id = event.eventID;
            eventCell2.style.top = '0px';
            eventCell2.style.height = leftoverMinutes +'px';
            eventCell2.innerHTML = `<div>${event.title}</div>`;;
            eventCell2.innerHTML += `<div>${event.subtitle}</div>`;
            eventCell2.style.width = event.eventWidth +'px';
            eventSlotEnd.appendChild(eventCell2); 
          }

          else if((weekDays.includes(event.eventDay))&&!(weekDays.includes(event.eventDayEnd))){

            const eventColumn = document.getElementById(event.eventDay);
            const eventCell = document.createElement("div");
            const leftoverMinutes = event.eventStart + event.eventLength - 48 * 30;
            eventCell.classList.add("event");
            eventCell.id = event.eventID;
            eventCell.style.top = event.eventStart +'px'
            eventCell.style.height = event.eventLength - leftoverMinutes + 'px';
            eventCell.innerHTML = `<div>${event.title}</div>`;
            eventCell.innerHTML += event.subtitle;
            eventCell.style.width = event.eventWidth +'px';
            eventColumn.appendChild(eventCell);
          }
          else if((weekDays.includes(event.eventDayEnd))&&!(weekDays.includes(event.eventDay))){
            const eventColumn = document.getElementById(event.eventDayEnd);
            const leftoverMinutes = event.eventStart + event.eventLength - 48 * 30;
            const eventCell = document.createElement("div");
            eventCell.classList.add("event");
            eventCell.id = event.eventID;
            eventCell.style.top = '0px';
            eventCell.style.height = leftoverMinutes +'px';
            eventCell.innerHTML = `<div>${event.title}</div>`;
            eventCell.innerHTML += `<div>${event.subtitle}</div>`;
            eventCell.style.width = event.eventWidth +'px';
            eventColumn.appendChild(eventCell); 
          }

        } 
    }
    else console.error("Event outside of the week-range")
})}

function fixOverlapping() {
  weekDays.forEach(weekday => {
    const day = document.getElementById(weekday);
    const events = Array.from(day.querySelectorAll(".event"));

    if (day.children.length > 1) {

      const eventData = events.map(event => ({
        id: event.id,
        start: parseInt(event.style.top),
        end: parseInt(event.style.top) + parseInt(event.style.height),
        element: event,
        columnIndex: null
      }));

      eventData.sort((a, b) => a.start - b.start);

      let i = 0;

      while (i < eventData.length) {

        const group = [];
        const columns = [];

        const firstEvent = eventData[i];
        group.push(firstEvent);
        columns.push(firstEvent);
        firstEvent.columnIndex = 0;

        let groupEnd = firstEvent.end;

        for (let nextEventIndex = i + 1; nextEventIndex < eventData.length; nextEventIndex++) {
          const nextEvent = eventData[nextEventIndex];

          if (nextEvent.start < groupEnd) {

            let assignedColumnIndex = undefined;
            for (let x = 0; x < columns.length; x++) {
              if (columns[x].end <= nextEvent.start) {
                assignedColumnIndex = x;
              }
            }
            if (assignedColumnIndex === undefined) {
              assignedColumnIndex = columns.length;
            }

            nextEvent.columnIndex = assignedColumnIndex;
            columns[assignedColumnIndex] = nextEvent;
            group.push(nextEvent);

            if (nextEvent.end > groupEnd) {groupEnd = nextEvent.end};
          } 
        }

        let maxOverlap = 0;

        const groupStartTime = Math.min(...group.map(event => event.start));
        const groupEndTime = Math.max(...group.map(event => event.end));

        for (let timePixel = groupStartTime; timePixel <= groupEndTime; timePixel++) {
          const count = group.filter(event => event.start <= timePixel && event.end > timePixel).length;
          if (count > maxOverlap) {maxOverlap = count};
        }

        const width = (300 / maxOverlap);

        group.forEach(event => {
          event.element.style.width = width + "px";
          event.element.style.marginLeft = (event.columnIndex * width) + "px";
        });

        i += group.length;
      }
    }
  });
}

function findWeek(xmlFile) {
  weekDays = [];
  let file = xmlFile.responseXML;
  let UnixTime = file.getElementsByTagName("dayinweek")[0].textContent;

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

function generateCalendar(days) {
  var calendarContainer = document.getElementById("calendar");
  calendarContainer.innerHTML = "";

  const timeColumn = document.createElement("div");
  timeColumn.classList.add("time-column");

  const emptyCell = document.createElement("div");
  emptyCell.className = "time-cell";

  timeColumn.appendChild(emptyCell);
  
  for (let i = 0; i < 48; i++) {
    let timeLabel = i * 30;

    const timeCell = document.createElement("div");
    timeCell.className = "time-cell";

    if (timeLabel % 60 == 0) {
      if (timeLabel / 60 < 10) {
        timeCell.innerHTML += "<p>0" + timeLabel / 60 + ":00</p>";
      } else {
        timeCell.innerHTML += "<p>"+timeLabel / 60 + ":00</p>";
      }
    } else {
      timeCell.innerHTML = "";
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

function structureWeekdays(day) {
  return `${days[day.getDay()]} ${day.getDate()} ${months[day.getMonth()]}`;
}

function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}
