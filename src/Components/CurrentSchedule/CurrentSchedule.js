import React, { useState } from "react";
import {
  Container,
  Grid,
  Paper,
  makeStyles,
  CssBaseline,
  Avatar,
  Tooltip,
} from "@material-ui/core";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { connect } from "react-redux";
import "./CurrentSchedule.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import CustomToolbar from "../CustomToolbar/CustomToolbar.js";
import MasterModal from "../MasterModal/MasterModal.js";
import {
  setAircrafts,
  setLocations,
  setCrewPostions,
  setAirmen,
  setAircraftModels,
  setFlights,
} from "../../Redux/actions.js";

// import userData from "./userData.js";
import { AvatarGroup } from "@material-ui/lab";

import { WebSocketFrame } from "../WebSocket/WebSocket.js";

const DragAndDropCalendar = withDragAndDrop(Calendar);

const useStyles = makeStyles((theme) => ({
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(1),
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
  console.log("online users", props.online_users);
  let today = new Date();
  const localizer = momentLocalizer(moment);
  // Event Modal functions
  // const selectedEventRef = useRef(null);
  // const [eventModal, setEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
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

  const moveEvent = ({ event, start, end, isAllDay: droppedOnAllDaySlot }) => {
    // console.log("Moving", event);
    // removes event from current events
    const updatedEvents = props.events.filter(
      (item) => item.flight_uuid !== event.flight_uuid
    );
    // adds the new event w/ updated parameters
    const updatedEvent = { ...event, start, end, allDay: droppedOnAllDaySlot };
    updatedEvents.push(updatedEvent);
    // Send A Patch Request
    // console.log("AllDay BS:", droppedOnAllDaySlot);
    WebSocketFrame.flightHandler("edit", {
      flight_uuid: event.flight_uuid,
      start_time: start,
      end_time: end,
      allDay: droppedOnAllDaySlot ? droppedOnAllDaySlot : false,
    });

    // axios
    //   .patch(
    //     "/flight/" + event.flight_uuid,
    //     {
    //       start_time: start,
    //       end_time: end,
    //       all_day: droppedOnAllDaySlot ? droppedOnAllDaySlot : false,
    //     },
    //     { headers: { "Content-Type": "application/json" } }
    //   )
    //   .then((response) => {
    //     console.log("Response from Put:", response);
    //     // Reason we only update until we get a good response back is because the backend will check for conflicts
    //     //setEvents(updatedEvents);
    //   })
    //   .catch((error) => {
    //     console.log("Error:", error);
    //   });
  };
  // Randomize color for avatar
  let colors = [
    "#D50000",
    "#FF5722",
    "#FFC107",
    "#4CAF50",
    "#3174ad",
    "#3F51B5",
    "#9C27B0",
  ];

  return (
    <>
      {props.events && props.events.length > 0 ? (
        <Container maxWidth="lg" className={classes.container}>
          <CssBaseline />
          <MasterModal
            handleClose={handleClose}
            open={open}
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            events={props.events}
            //setEvents={setEvents}
            showAll={showAll}
            setShowAll={setShowAll}
            selectedEvent={selectedEvent}
            showDelete={showDelete}
            setDelete={setDelete}
          />
          <Grid container spacing={1}>
            <Grid item xs={12} md={12} lg={12}>
              {/* Avatar User count */}
              <Grid
                item
                container
                xs={12}
                justify="flex-end"
                alignItems="baseline"
              >
                <AvatarGroup max={5}>
                  {props.online_users &&
                    props.online_users.map((item, index) => {
                      return (
                        <Tooltip
                          title={`${item.first_name} ${item.last_name}`}
                          key={item.first_name + item.last_name}
                        >
                          <Avatar style={{ backgroundColor: colors[index] }}>
                            {`${item.first_name.substr(
                              0,
                              1
                            )}${item.last_name.substr(0, 1)}`}
                          </Avatar>
                        </Tooltip>
                      );
                    })}
                </AvatarGroup>
              </Grid>
              {/* Calendar App */}
              <Paper>
                <DragAndDropCalendar
                  selectable
                  localizer={localizer}
                  events={props.events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: "82vh", width: "100%" }}
                  onSelectSlot={handleBigCalendarSelect}
                  onSelectEvent={handleBigCalendarSelect}
                  eventPropGetter={eventStyleGetter}
                  // dayPropGetter={dayPropGetter}
                  onEventDrop={moveEvent}
                  components={{ toolbar: CustomToolbar }}
                />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      ) : null}
    </>
  );
}

const mapDispatchToProps = {
  aircraftAction: setAircrafts,
  locationAction: setLocations,
  crewPositionAction: setCrewPostions,
  airmenAction: setAirmen,
  aircraftModelAction: setAircraftModels,
  flightAction: setFlights,
};

const mapStateToProps = (state) => {
  return { online_users: state.onlineReducer };
};
export default connect(mapStateToProps, mapDispatchToProps)(CurrentSchedule);
