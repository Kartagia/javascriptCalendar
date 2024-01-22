# Calendar for custom calendars and temporal systems by Antti Kautiainen

This package contains generic calendar interfaces for creating calendar.
The calendar may be compatible with ISO-standard calendar, or form a 
separate temporal calendar compatiblity space for implementing purely 
fictional calendars. 

GIT: [link](https://github.com/Kartagia/javascriptCalendar/)
Home page [link](https://github.com/Kartagia/javascriptCalendar/)
Documentation: [link](https://github.com/Kartagia/javascriptCalendar/docs)

## Authors
- Antti Kautiainen [link](github.com/Kartagia) (founder)

## USAGE

### Installation

    npm install @Kartagia/calendar

### Use in code

#### CommonJS

    const Calendar = require("@Kartagia/calendar");

    // Create a calendar of Shire not linked to the ISO calendars, but calendar space "MERP"
    const calendar = Calendar.createCalendar("Shire", {group: "MERP"})

    // Create a calendar of Ars Magica linked to the ISO calendar wiht start of year at March 21st.
    const ariesianCalendar = Calendar.createCalendar("Ariesian", {
      startOfYear: { calendar: "ISO", month: 3, day: 21 ),
      // The year of the Ariesien calendar has 1 AY at 140BC.
      offset: { year: (canonicalYear) => (year - 139) }, 
    })
    const newYear1400AY = ariesianCalendar.createDate({day: 1, month: 1, year: 1400})

    // Create a calendar of Julian reckoning with year staring on 21st of March. 
    const calendarDefinition = {
      startOfYear: { month: 3, day: 21 }, // THe start of year using the created calendar day of month.
      // The function determining whether the year is a leap year.
      leapyYear: (canonicalYear) => ( (canonicalYear +1) % 4 ),
      offset: { 
        // The day offset at the beginning of the year due different leap year. 
        day: (canonicalYear) => ( Math.floor(7 + (canonicalYear-1200) / 100 - (canonicalYear - 1200)/400)),
      }
    };
    const julianCalendar = Calendar.createCalendar("Julian", calendarDefinition);

####  Harmony/ES6

    import {Calendar, DateInstance} from "@Kartagia/calendar";

    // Create a calendar of Shire not linked to the ISO calendars, but calendar space "MERP"
    const calendar = Calendar.createCalendar("Shire", {group: "MERP"})

    // Create a calendar of Ars Magica linked to the ISO calendar wiht start of year at March 21st.
    const ariesianCalendar = Calendar.createCalendar("Ariesian", {
      startOfYear: { calendar: "ISO", month: 3, day: 21 ),
      // The year of the Ariesien calendar has 1 AY at 140BC.
      offset: { year: (canonicalYear) => (year - 139) }, 
    })
    const newYear1400AY = ariesianCalendar.createDate({day: 1, month: 1, year: 1400})
    const alternateNY1400AY = new DateInstance({day: 1, month: 1, year: 1400, calendar: ariesianCalendar});

    // Create a calendar of Julian reckoning with year staring on 21st of March. 
    const calendarDefinition = {
      startOfYear: { month: 3, day: 21 }, // The start of year using the created calendar day of month.
      // The function determining whether the year is a leap year.
      leapyYear: (canonicalYear) => ( (canonicalYear +1) % 4 ),
      offset: { 
        // The day offset at the beginning of the year due different leap year. 
        day: (canonicalYear) => ( Math.floor(7 + (canonicalYear-1200) / 100 - (canonicalYear - 1200)/400)),
      }
    };
    const julianCalendar = Calendar.createCalendar("Julian", calendarDefinition);



## Details of the module

### enum Intervals

The enumeration containing the default intervals of the dates: Day,
Month, Year, TropicalYear, SiderealYear, SolilunarYear, LunarYear.

### enum BaseFields 

The enumeration containing the base feilds in the descending order
of accuracy: Era, Year, MonthOfYear, WeekOfYear, WeekOfMonth, DayOfYear, 
DayOfMonth,DayOfWeek.

### interface TemporalFieldly<BASE extends temporalFieldly = Intervals.Day>

This interface represents a temporal field. The base determines the 
accuracy of the interface. The default accuracy is the ISO calendar
date. 

### interface TempralFieldlyValue<BASE extends TemporalFieldly>

This interface represents a temporal fieldly with value attached
to it. 

Implements: Comparable<TemporalFieldlyValue<TemporalFieldly>>

### interface TemporalInterval<BASE extends TemporalFieldly>

An interval, which operates on the scale of hte given base temporal fieldly.
The interval ignores are temporal values with greater precision than the
given base field.


### class Calendar

The base class defining calendars. It has list of the temporal fields
the calendar supports. The calendar stores details of the field implementations
and validation of the field values as well as calculation of the field
values.

### class ISO extends Calendar

The calendar implementing the ISO calendar standard implementation for a date.
The calendar contains the ISO date fields as static constants. 

### class TemporalField implements TemporalFieldly

The basic implementation of a temporal field. 

### class TemporalFieldValue implements TemporalFeildyValue

The basic implementation of a temporal field with value.

## class TemporalFieldInterval<FIELD extends TemporalField> implmements TemporalInterval<FIELD>

Class representing an interval of values of a specific temporal field. 

### class TemporalInstance<FIELD extends TemporalFieldly> extends TemporalFieldyValue<FIELD>

The class implememnting an instance of a temporal field. 

### class DateInstance extends TemporalInstance<ISO.Date>
