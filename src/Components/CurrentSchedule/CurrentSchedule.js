import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  makeStyles,
  CssBaseline,
} from "@material-ui/core";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { connect } from "react-redux";
import "react-big-calendar/lib/css/react-big-calendar.css";
import MasterModal from "../MasterModal/MasterModal.js";
import {
  setAircrafts,
  setLocations,
  setCrewPostions,
  setAirmen,
  setAircraftModels,
  setFlights,
} from "../../Redux/actions.js";
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
  fixedHeight: {
    height: 240,
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalPaper: {
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    width: "100vw",
    height: "100vh",
  },
  menuPaper: {
    margin: theme.spacing(1, 3, 1, 3),
  },
  textField: {
    margin: theme.spacing(1, 1, 1, 3),
    width: "50vw",
  },
  titleResize: {
    fontSize: 25,
  },
  descriptionResize: {
    backgroundColor: "#dadce0",
    padding: theme.spacing(3, 3, 3, 3),
    borderRadius: "5px",
  },
  dateStyle: {
    margin: theme.spacing(1, 1, 1, 3),
  },
  timeStyle: {
    margin: theme.spacing(1, 3, 1, 0),
  },
  submitBtn: {
    paddingLeft: theme.spacing(3),
  },
}));

function CurrentSchedule(props) {
  const classes = useStyles();
  const [events, setEvents] = useState(null);
  const {
    aircraftAction,
    locationAction,
    crewPositionAction,
    airmenAction,
    aircraftModelAction,
    flightAction,
    flightEvents 
  } = props;

  useEffect(() => {
    let date = new Date(),
      y = date.getFullYear(),
      m = date.getMonth();
    let firstDay = new Date(y, m, 1);
    let lastDay = new Date(y, m + 1, 0, 23, 59, 59);
    axios
      .get("/essential", { params: { start: firstDay, end: lastDay } })
      .then((response) => {
        console.log("Response Data:", response.data);
        aircraftAction(response.data.aircrafts);
        locationAction(response.data.locations);
        airmenAction(response.data.airmen);
        aircraftModelAction(response.data.aircraft_models);
        flightAction(response.data.flights);
        crewPositionAction(response.data.crew_positions);

        setEvents(Object.values(response.data.flights));

      })
      .catch((error) => {
        console.log("Get Error:", error);
      });
  }, [aircraftAction, locationAction, airmenAction, aircraftModelAction, flightAction, crewPositionAction]);

  let today = new Date();
  const localizer = momentLocalizer(moment);
  // Event Modal functions
  // const selectedEventRef = useRef(null);
  // const [eventModal, setEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState({});
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [showDelete, setDelete] = useState(true);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const [showAll, setShowAll] = useState(true);
  const handleBigCalendarSelect = (event) => {
    // console.log(event);
    // console.log("start", event.start, "end", event.end);
    // TODO make an option for AM/PM time (12 hours)
    setDelete(true);
    if (event.flight_uuid === undefined) {
      console.log("not an event", event);
      setDelete(false);
    }
    setSelectedEvent(event);
    setShowAll(true);
    setStartDate(moment(event.start).toDate());
    setEndDate(moment(event.end).toDate());
    handleOpen();
  };

  const eventStyleGetter = (event) => {
    // console.log("prop e", event);
    var style = {
      backgroundColor: event.color,
      borderRadius: "7px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
    };
    return {
      style: style,
    };
  };

  const dayPropGetter = (event) => {
    // console.log(event);
    // const style = {
    //   backgroundColor: "white",
    //   // color: "white",
    // };
    // return {
    //   style: style,
    // };
  };
  return (
    <>
      {events && events.length > 0 ? (
        <Container maxWidth="lg" className={classes.container}>
          <CssBaseline />
          <MasterModal
            handleClose={handleClose}
            open={open}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            events={events}
            setEvents={setEvents}
            showAll={showAll}
            setShowAll={setShowAll}
            selectedEvent={selectedEvent}
            showDelete={showDelete}
            setDelete={setDelete}
          />
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
              <Paper>
                <Calendar
                  selectable
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: "82vh" }}
                  onSelectSlot={handleBigCalendarSelect}
                  onSelectEvent={handleBigCalendarSelect}
                  eventPropGetter={eventStyleGetter}
                  // dayPropGetter={dayPropGetter}
                />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      ) : null}
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    flightEvents: state.flightReducer ? Object.values(state.flightReducer) : [],
  };
};

const mapDispatchToProps = {
  aircraftAction: setAircrafts,
  locationAction: setLocations,
  crewPositionAction: setCrewPostions,
  airmenAction: setAirmen,
  aircraftModelAction: setAircraftModels,
  flightAction: setFlights,
};

export default connect(mapStateToProps, mapDispatchToProps)(CurrentSchedule);
