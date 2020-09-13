import React, { useState, useEffect } from "react";
import { Grid, Paper, makeStyles, Modal, Fade, Backdrop, TextField, List, ListItem, ListItemText, MenuItem, Menu, Chip,
  IconButton, ListItemIcon, Checkbox, FormControl, FormControlLabel, Select, InputLabel, Tooltip,
} from "@material-ui/core";
import { Close, LocalAirport, Room, FiberManualRecord, CheckCircle, Delete, } from "@material-ui/icons";
import { Autocomplete } from "@material-ui/lab";
import moment from "moment";
import MomentUtils from "@date-io/moment";
import { DatePicker, TimePicker, MuiPickersUtilsProvider, } from "@material-ui/pickers";
// import data from "../CurrentSchedule/data.js";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { connect } from "react-redux";
import { setFlights } from "../../Redux/actions.js";
import axios from "axios";
moment.locale("en");

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
    overflow: "scroll",
    height: "100%",
    width: "100%",
  },
  modalPaper: {
    backgroundColor: theme.palette.background.paper,
    // border: "2px solid #000",
    // boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    width: "100vw",
    minHeight: "100vh",
    height: "100%",
  },
  menuPaper: {
    margin: theme.spacing(1, 3, 1, 3),
  },
  textField: {
    margin: theme.spacing(0, 1, 1, 3),
    width: "80%",
  },
  titleResize: {
    fontSize: 25,
  },
  descriptionResize: {
    padding: theme.spacing(3, 3, 3, 3),
    border: "1px solid grey",
    borderRadius: "5px",
  },
  dateStyle: {
    margin: theme.spacing(1, 1, 1, 3),
  },
  timeStyle: {
    margin: theme.spacing(1, 3, 1, 0),
  },
  submitBtn: {
    padding: theme.spacing(0, 0, 0, 0),
  },
  pilotStyle: {
    width: "50vw",
    padding: theme.spacing(1, 1, 1, 3),
    "& > * + *": {
      marginTop: theme.spacing(3),
    },
  },
  colorPicker: {
    margin: theme.spacing(0, 0, 0, 5),
  },
  // small Modal css
  smallModalPaper: {
    backgroundColor: theme.palette.background.paper,
    // border: "2px solid #000",
    borderRadius: "10px",
    // boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    width: "40vw",
    height: "80%",
  },
  smallTitleResize: {
    fontSize: 20,
  },
  smallCloseBtn: {
    // padding: theme.spacing(0, 1, 0, 0),
  },
  smallSubmitBtn: {
    margin: theme.spacing(1, 1, 1, 0),
  },
}));
// options for pilots
const pilots = [
  {
    name: "Franz Ferdinand",
  },
  {
    name: "John Doe",
  },
  {
    name: "Jane Doe",
  },
];


function MasterModal(props) {
  const classes = useStyles();
  // const [locale, setLocale] = useState("en");
  // const [events, setEvents] = useState(data);
  const [title, setTitle] = useState("");
  const [maximized, setMaximized] = useState(false);
  const [allDay, setAllDay] = useState(false);
  const [selectedPilots, setPilots] = useState(null);
  const [selectedColor, setColor] = useState("");
  const [description, setDesc] = useState("");
  const [locations, setLocations] = useState(null);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(0);
  const [aircrafts, setAircrafts] = useState(null);
  const [aircraftModels, setAircraftModels] = useState(null);
  const [selectedAircraftIndex, setSelectedAircraftIndex] = useState(0);
  let propsLocations = props.locations;
  let propsAircrafts = props.aircrafts;
  let propsAircraftModels = props.airacraft_models;


  useEffect(() => {
    if (propsLocations) {
      setLocations(propsLocations.map((item) => { 
        if (typeof item.disabled === 'undefined' || item.disabled === null) {
          item.disabled = false;
        }
        return item;
      }));
    }
  }, [propsLocations]);

  useEffect(() => {
    if (propsAircraftModels) {
      let modelsObj = {};
      for (const model of propsAircraftModels) {
        modelsObj[model.model_uuid] = model;
      }
      setAircraftModels(modelsObj);
    }
  }, [propsAircraftModels]);


  useEffect(() => {
    if (propsAircrafts && aircraftModels) {
      setAircrafts(propsAircrafts.map((item) => {
        if (typeof item.diabled === 'undefined' || item.disabled === null) {
          item.disabled = (item.status !== 'Available');
          item.aircraft_name = aircraftModels[item.model_uuid].model_name;
        }
        return item;
      }))
    }
  }, [propsAircrafts, aircraftModels]);


  useEffect(() => {
    console.log("Aircrafts:", aircrafts);
  }, [aircrafts])

  useEffect(() => {
    if (props.selectedEvent) {
      console.log("Event Opened:", props.selectedEvent);
      setTitle(props.selectedEvent.title);
      setPilots(props.selectedEvent.crew_members);
      setAllDay(props.selectedEvent.allday);
      if (props.selectedEvent.color) setColor(props.selectedEvent.color);
      setDesc(props.selectedEvent.description);
      let locationIndex = propsLocations.findIndex((location) => location.location_uuid === props.selectedEvent.location_uuid)
      setSelectedLocationIndex(locationIndex !== -1 ? locationIndex : 0);
      let aircraftIndex = aircrafts.findIndex((aircraft) => aircraft.aircraft_uuid === props.selectedEvent.aircraft_uuid)
      setSelectedAircraftIndex(aircraftIndex !== -1 ? aircraftIndex : 0);
    }
  }, [props.selectedEvent, propsLocations, aircrafts]);
  // Modal functions

  const handleClose = () => {
    // setOpen(false);
    props.handleClose();
    props.setShowAll(false);
    setMaximized(false);
  };
  // Aircraft Menu functions
  const [anchorEl, setAnchorEl] = React.useState(null);


  const handleClickListItem = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAircraftSelectClick = (event, index) => {
    setSelectedAircraftIndex(index);
    setAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  // Airspace Menu functions
  const [anchorEl2, setAnchorEl2] = React.useState(null);

  const handleClickListItem2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleLocationSelectClick = (event, index) => {
    setSelectedLocationIndex(index);
    setAnchorEl2(null);
  };

  const handleMenuClose2 = () => {
    setAnchorEl2(null);
  };

  const handleDelete = () => {
    axios.delete("/flight/"+props.selectedEvent.flight_uuid)
    .then((response) => {
      console.log("Response from Delete:", response);
    })
    .catch((error) => {
      console.log("Error:", error);
    });
    props.setEvents(
      props.events.filter(
        (obj) => obj.flight_uuid !== props.selectedEvent.flight_uuid
      )
    );
    // reset color to default for next event
    setColor("");
    handleClose();
  };
  // adds new event/edit existing event to JSON object
  // TODO: check for empty strings/fields
  const onSubmit = () => {
    console.log("color", selectedColor,
      "id", props.selectedEvent.flight_uuid,
      "aircraft", aircrafts[selectedAircraftIndex].aircraft_uuid,
      "title", title,
      "start", props.startDate,
      "end", props.endDate,
      "all day", allDay,
      "pilots", selectedPilots
    );

    let objIndex = -1;
    if (props.selectedEvent.flight_uuid !== undefined) {
      objIndex = props.events.findIndex(
        (obj) => obj.flight_uuid === props.selectedEvent.flight_uuid
      );
    }
    // if index exist > -1, then modify object else create new object in array

    // Updating existing Event
    if (objIndex >= 0) {
      const newEvents = [...props.events];
      newEvents[objIndex] = {
        flight_uuid: props.selectedEvent.flight_uuid,
        color: selectedColor,
        title: title,
        start: props.startDate,
        end: props.endDate,
        allDay: allDay ? allDay : false,
        aircraft_uuid: aircrafts[selectedAircraftIndex].aircraft_uuid,
        location_uuid: locations[selectedLocationIndex].location_uuid,
        crew_members: selectedPilots,
        description: props.selectedEvent.description
      };
      props.setEvents(newEvents);

      // Send A Put Request
      axios.put("/flight/"+props.selectedEvent.flight_uuid, 
        {
          flight_uuid: props.selectedEvent.flight_uuid,
          color: selectedColor,
          title: title,
          start_time: props.startDate,
          end_time: props.endDate,
          all_day: allDay ? allDay : false,
          aircraft_uuid: aircrafts[selectedAircraftIndex].aircraft_uuid,
          location_uuid: locations[selectedLocationIndex].location_uuid,
          crew_members: selectedPilots,
          description: props.selectedEvent.description
        },
        {headers: {"Content-Type": "application/json"}}
      )
      .then((response) => {
        console.log("Response from Put:", response);
      })
      .catch((error) => {
        console.log("Error:", error);
      });

    // Creating a new event
    // TODO: 
      // Need to fix description (add state and place to update description)
      // Need to fix crew_members
    } else {
      
      // Call A Post Request
      // TODO: 
        // Need to fix description (add state and place to update description)
        // Need to fix crew_members
      axios.post("/flight",
        {
          color: selectedColor !== "" ? selectedColor : "#3174ad",
          title: title ? title : "",
          start_time: props.startDate,
          end_time: props.endDate,
          all_day: allDay ? allDay : false,
          aircraft_uuid: aircrafts[selectedAircraftIndex].aircraft_uuid,
          location_uuid: locations[selectedLocationIndex].location_uuid,
          crew_members: [],
          description: ""
        }, 
        {headers: {"Content-Type": "application/json"}}
      )
      .then((response) => {
        console.log("Response from Post:", response);

        const newEvents = [
          ...props.events,
          {
            flight_uuid: response.data.flight_uuid,
            color: selectedColor !== "" ? selectedColor : "#3174ad",
            title: title,
            start: props.startDate,
            end: props.endDate,
            allDay: allDay ? allDay : false,
            aircraft_uuid: aircrafts[selectedAircraftIndex].aircraft_uuid,
            location_uuid: locations[selectedLocationIndex].location_uuid,
            crew_members: [],
            description: "",
          },
        ];
        props.setEvents(newEvents);

      })
      .catch((error) => {
        console.log("Error:", error);
      });
      // Need to update id we get back
    }
    // reset color to default for next event
    setColor("");
    handleClose();
  };
  // Calendar function

  const handleStartDateSelect = (date) => {
    if (date._d > props.endDate) {
      props.setEndDate(moment(date).toDate());
    }
    props.setStartDate(moment(date).toDate());
  };

  const handleEndDateSelect = (date) => {
    if (date._d < props.startDate) {
      props.setStartDate(moment(date).toDate());
    }
    props.setEndDate(moment(date).toDate());
  };

  const handleCheckbox = (event) => {
    console.log("checkbox", event.target.checked);
    setAllDay(event.target.checked);
  };
  const handlePilots = (event, value) => {
    // console.log(value, "pilot", value[0].name);
    setPilots(value);
  };
  // small modal functions
  const toggleOptions = () => {
    setMaximized(!maximized);
  };

  const handleColor = (event) => {
    console.log("color handle", event.target.value);
    setColor(event.target.value);
  };
  return (
    <>
      {props.showAll ? (
        <>
          {maximized ? (
            <Modal
              aria-labelledby="transition-modal-title"
              aria-describedby="transition-modal-description"
              className={classes.modal}
              open={props.open}
              onClose={handleClose}
              closeAfterTransition
              BackdropComponent={Backdrop}
              BackdropProps={{
                timeout: 500,
              }}
            >
              <Fade in={props.open}>
                {/* Modal */}
                <form>
                  <Grid container className={classes.modalPaper}>
                    {/* Title and Close button */}
                    <Grid container item direction="row">
                      {/* Title */}
                      <Grid item xs={10}>
                        <TextField
                          label="Title"
                          placeholder="Add Title"
                          value={title ? title : ""}
                          className={classes.textField}
                          size="medium"
                          fullWidth
                          margin="normal"
                          InputLabelProps={{
                            shrink: true,
                          }}
                          InputProps={{
                            classes: {
                              input: classes.titleResize,
                            },
                          }}
                          onChange={(e) => {
                            setTitle(e.target.value);
                          }}
                          disabled={props.role === "User" ? true : false}
                        />
                      </Grid>
                      {/* Close button */}
                      <Grid
                        item
                        container
                        xs={2}
                        className={classes.submitBtn}
                        justify="flex-end"
                        alignItems="baseline"
                      >
                        {props.showDelete && props.role !== "User" ? (
                          <IconButton
                            aria-label="delete"
                            onClick={handleDelete}
                          >
                            <Delete />
                          </IconButton>
                        ) : null}
                        <IconButton aria-label="close" onClick={handleClose}>
                          <Close />
                        </IconButton>
                      </Grid>
                    </Grid>
                    {/* Date/Time */}
                    <Grid container item direction="row">
                      <Grid item xs={12}>
                        <MuiPickersUtilsProvider
                          libInstance={moment}
                          utils={MomentUtils}
                          //locale={locale}
                        >
                          {/* Use Format for visual formatting */}
                          <DatePicker
                            autoOk
                            disableToolbar
                            variant="inline"
                            label="Start Date"
                            value={props.startDate}
                            onChange={(date) => handleStartDateSelect(date)}
                            className={classes.dateStyle}
                            disabled={props.role === "User" ? true : false}
                          />
                          {/* Use Format for visual formatting */}
                          {allDay ? null : (
                            <TimePicker
                              autoOk
                              ampm={false}
                              label="Start Time"
                              variant="inline"
                              value={props.startDate}
                              onChange={(date) => handleStartDateSelect(date)}
                              className={classes.timeStyle}
                              disabled={props.role === "User" ? true : false}
                            />
                          )}
                          {/* End Date/Time picker */}
                          {/* Use Format for visual formatting */}
                          <DatePicker
                            disableToolbar
                            autoOk
                            variant="inline"
                            label="End Date"
                            value={props.endDate}
                            onChange={(date) => handleEndDateSelect(date)}
                            className={classes.dateStyle}
                            disabled={props.role === "User" ? true : false}
                          />
                          {/* Use Format for visual formatting */}
                          {allDay ? null : (
                            <TimePicker
                              ampm={false}
                              autoOk
                              label="End Time"
                              variant="inline"
                              value={props.endDate}
                              onChange={(date) => handleEndDateSelect(date)}
                              className={classes.timeStyle}
                              disabled={props.role === "User" ? true : false}
                            />
                          )}
                        </MuiPickersUtilsProvider>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={allDay}
                              onChange={handleCheckbox}
                              color="primary"
                              disabled={props.role === "User" ? true : false}
                            />
                          }
                          label="All day"
                        />
                      </Grid>
                    </Grid>
                    {/* Dropdown menu */}
                    <Grid
                      item
                      container
                      direction="row"
                      className={classes.menuPaper}
                    >
                      {/* Aircraft  menu */}
                      <Grid item xs={6}>
                        <List component="nav" aria-label="Aircraft">
                          <ListItem
                            button
                            aria-haspopup="true"
                            aria-controls="lock-menu"
                            aria-label="Aircraft"
                            onClick={handleClickListItem}
                            disabled={props.role === "User" ? true : false}
                          >
                            <ListItemIcon>
                              <LocalAirport />
                            </ListItemIcon>
                            <ListItemText
                              primary="Aircraft"
                              secondary={
                                aircrafts ? aircrafts[selectedAircraftIndex].aircraft_name : null
                              }
                            />
                          </ListItem>
                        </List>
                        <Menu
                          id="lock-menu"
                          anchorEl={anchorEl}
                          keepMounted
                          open={Boolean(anchorEl)}
                          onClose={handleMenuClose}
                        >
                          {aircrafts && aircrafts.map((aircraft, index) => (
                            <MenuItem
                              key={aircraft.aircraft_name+index}
                              disabled={aircraft.disabled}
                              selected={index === selectedAircraftIndex}
                              onClick={(event) =>
                                handleAircraftSelectClick(event, index)
                              }
                            >
                              {aircraft.aircraft_name}
                            </MenuItem>
                          ))}
                        </Menu>
                      </Grid>
                      {/* Airspace menu */}
                      <Grid item xs={6}>
                        <List component="nav" aria-label="Airspace">
                          <ListItem
                            button
                            aria-haspopup="true"
                            aria-controls="lock-menu"
                            aria-label="Location"
                            onClick={handleClickListItem2}
                            disabled={props.role === "User" ? true : false}
                          >
                            <ListItemIcon>
                              <Room />
                            </ListItemIcon>
                            <ListItemText
                              primary="Location"
                              secondary={
                                locations ? locations[selectedLocationIndex].location_name : null
                              }
                            />
                          </ListItem>
                        </List>
                        <Menu
                          id="lock-menu"
                          anchorEl={anchorEl2}
                          keepMounted
                          open={Boolean(anchorEl2)}
                          onClose={handleMenuClose2}
                        >
                          {locations && locations.map((location, index) => (
                            <MenuItem
                              key={location.location_name}
                              disabled={location.disabled}
                              selected={index === selectedLocationIndex}
                              onClick={(event) =>
                                handleLocationSelectClick(event, index)
                              }
                            >
                              {location.location_name}
                            </MenuItem>
                          ))}
                        </Menu>
                      </Grid>
                    </Grid>
                    {/* Pilots & color */}
                    <Grid item container direction="row">
                      <Grid item sm={6} md={6} xl={6}>
                        <Autocomplete
                          multiple
                          id="tags-standard"
                          options={pilots}
                          getOptionLabel={(option) => option.name}
                          value={selectedPilots ? selectedPilots : []}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="standard"
                              label="Pilots"
                              placeholder="Add pilots"
                              InputLabelProps={{
                                shrink: true,
                              }}
                              disabled={props.role === "User" ? true : false}
                            />
                          )}
                          onChange={handlePilots}
                          className={classes.pilotStyle}
                          disabled={props.role === "User" ? true : false}
                        />
                      </Grid>
                      {/*TODO: add tickmark icon when selected */}
                      <Grid item sm={4} md={4} xl={4}>
                        {/* Color picker */}
                        <FormControl className={classes.colorPicker}>
                          <InputLabel shrink>Color</InputLabel>
                          <Select
                            labelId="color-label"
                            id="color-select"
                            value={selectedColor}
                            onChange={handleColor}
                            displayEmpty
                            disabled={props.role === "User" ? true : false}
                            renderValue={(e) => {
                              console.log("color", e);
                              return e === "" || e === undefined ? (
                                <FiberManualRecord
                                  style={{ color: "#3174ad" }}
                                />
                              ) : (
                                <FiberManualRecord style={{ color: e }} />
                              );
                            }}
                          >
                            {/* red */}
                            <MenuItem value={"#D50000"}>
                              <Tooltip title="Tomato" placement="right-start">
                                {selectedColor === "#D50000" ? (
                                  <CheckCircle style={{ color: "#D50000" }} />
                                ) : (
                                  <FiberManualRecord
                                    style={{ color: "#D50000" }}
                                  />
                                )}
                              </Tooltip>
                            </MenuItem>
                            {/* orange */}
                            <MenuItem value={"#FF5722"}>
                              <Tooltip
                                title="Tangerine"
                                placement="right-start"
                              >
                                {selectedColor === "#FF5722" ? (
                                  <CheckCircle style={{ color: "#FF5722" }} />
                                ) : (
                                  <FiberManualRecord
                                    style={{ color: "#FF5722" }}
                                  />
                                )}
                              </Tooltip>
                            </MenuItem>
                            {/* yellow */}
                            <MenuItem value={"#FFC107"}>
                              <Tooltip title="Banana" placement="right-start">
                                {selectedColor === "#FFC107" ? (
                                  <CheckCircle style={{ color: "#FFC107" }} />
                                ) : (
                                  <FiberManualRecord
                                    style={{ color: "#FFC107" }}
                                  />
                                )}
                              </Tooltip>
                            </MenuItem>
                            {/* green */}
                            <MenuItem value={"#4CAF50"}>
                              <Tooltip title="Sage" placement="right-start">
                                {selectedColor === "#4CAF50" ? (
                                  <CheckCircle style={{ color: "#4CAF50" }} />
                                ) : (
                                  <FiberManualRecord
                                    style={{ color: "#4CAF50" }}
                                  />
                                )}
                              </Tooltip>
                            </MenuItem>
                            {/* blue */}
                            <MenuItem value={"#3174ad"}>
                              <Tooltip
                                title="Blueberry"
                                placement="right-start"
                              >
                                {selectedColor === "#3174ad" ? (
                                  <CheckCircle style={{ color: "#3174ad" }} />
                                ) : (
                                  <FiberManualRecord
                                    style={{ color: "#3174ad" }}
                                  />
                                )}
                              </Tooltip>
                            </MenuItem>
                            {/* indigo */}
                            <MenuItem value={"#3F51B5"}>
                              <Tooltip title="Lavender" placement="right-start">
                                {selectedColor === "#3F51B5" ? (
                                  <CheckCircle style={{ color: "#3F51B5" }} />
                                ) : (
                                  <FiberManualRecord
                                    style={{ color: "#3F51B5" }}
                                  />
                                )}
                              </Tooltip>
                            </MenuItem>
                            {/* Violet */}
                            <MenuItem value={"#9C27B0"}>
                              <Tooltip title="Grape" placement="right-start">
                                {selectedColor === "#9C27B0" ? (
                                  <CheckCircle style={{ color: "#9C27B0" }} />
                                ) : (
                                  <FiberManualRecord
                                    style={{ color: "#9C27B0" }}
                                  />
                                )}
                              </Tooltip>
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    {/* Description*/}
                    <Grid item container direction="row">
                      <Grid item sm={6} md={6} xl={6}>
                        <TextField
                          // label="Label"
                          placeholder="Add description"
                          multiline
                          rows={8}
                          rowsMax={8}
                          margin="normal"
                          value={description ? description : ""}
                          onChange={(e) => {
                            setDesc(e.target.value);
                          }}
                          className={classes.textField}
                          // InputLabelProps={{
                          //   style:
                          //   padding: ""
                          // }}
                          InputProps={{
                            disableUnderline: true,
                            classes: {
                              input: classes.descriptionResize,
                            },
                          }}
                          disabled={props.role === "User" ? true : false}
                        />
                      </Grid>
                    </Grid>
                    <div id="submit-btn" className={classes.submitBtn}>
                      <Chip
                        type="submit"
                        label="Save"
                        color="primary"
                        clickable
                        onClick={onSubmit}
                      />
                    </div>
                  </Grid>
                </form>
              </Fade>
            </Modal>
          ) : (
            /* ==================================================
					SMALL MODAL
					================================================== */

            <Modal
              aria-labelledby="transition-modal-title"
              aria-describedby="transition-modal-description"
              className={classes.modal}
              open={props.open}
              onClose={handleClose}
              closeAfterTransition
              BackdropComponent={Backdrop}
              BackdropProps={{
                timeout: 500,
              }}
            >
              <Fade in={props.open}>
                {/* Modal */}
                <Paper>
                  <form>
                    <Grid container className={classes.smallModalPaper}>
                      {/* Title and Close button */}
                      <Grid container item direction="row">
                        {/* Title */}
                        <Grid item xs={9}>
                          <TextField
                            label="Title"
                            placeholder="Add title"
                            value={title ? title : ""}
                            // className={classes.textField}
                            size="medium"
                            fullWidth
                            multiline
                            margin="normal"
                            InputLabelProps={{
                              shrink: true,
                            }}
                            InputProps={{
                              classes: {
                                input: classes.smallTitleResize,
                              },
                            }}
                            onChange={(e) => {
                              setTitle(e.target.value);
                            }}
                            disabled={props.role === "User" ? true : false}
                          />
                        </Grid>
                        {/* Close button */}
                        <Grid
                          container
                          item
                          xs={3}
                          className={classes.smallCloseBtn}
                          justify="flex-end"
                          alignItems="baseline"
                        >
                          {props.showDelete && props.role !== "User" ? (
                            <IconButton
                              aria-label="delete"
                              onClick={handleDelete}
                            >
                              <Delete />
                            </IconButton>
                          ) : null}
                          <IconButton aria-label="close" onClick={handleClose}>
                            <Close fontSize="small" />
                          </IconButton>
                        </Grid>
                      </Grid>
                      {/* Date/Time */}
                      <Grid container item direction="row">
                        <Grid item xs={12}>
                          <MuiPickersUtilsProvider
                            libInstance={moment}
                            utils={MomentUtils}
                            //locale={locale}
                          >
                            {/* Use Format for visual formatting */}
                            <DatePicker
                              autoOk
                              disableToolbar
                              variant="inline"
                              label="Start Date"
                              value={props.startDate}
                              onChange={(date) => handleStartDateSelect(date)}
                              className={classes.dateStyle}
                              disabled={props.role === "User" ? true : false}
                            />
                            {/* Use Format for visual formatting */}
                            {allDay ? null : (
                              <TimePicker
                                autoOk
                                ampm={false}
                                label="Start Time"
                                variant="inline"
                                value={props.startDate}
                                onChange={(date) => handleStartDateSelect(date)}
                                className={classes.timeStyle}
                                disabled={props.role === "User" ? true : false}
                              />
                            )}
                            {/* End Date/Time picker */}
                            {/* Use Format for visual formatting */}
                            <DatePicker
                              disableToolbar
                              autoOk
                              variant="inline"
                              label="End Date"
                              value={props.endDate}
                              onChange={(date) => handleEndDateSelect(date)}
                              className={classes.dateStyle}
                              disabled={props.role === "User" ? true : false}
                            />
                            {/* Use Format for visual formatting */}
                            {allDay ? null : (
                              <TimePicker
                                ampm={false}
                                autoOk
                                label="End Time"
                                variant="inline"
                                value={props.endDate}
                                onChange={(date) => handleEndDateSelect(date)}
                                className={classes.timeStyle}
                                disabled={props.role === "User" ? true : false}
                              />
                            )}
                          </MuiPickersUtilsProvider>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={allDay}
                                onChange={handleCheckbox}
                                color="primary"
                                disabled={props.role === "User" ? true : false}
                              />
                            }
                            label="All day"
                          />
                        </Grid>
                      </Grid>
                      {/* Dropdown menu */}
                      <Grid container item direction="row">
                        {/* Aircraft  menu */}
                        <Grid item xs={6}>
                          <List component="nav" aria-label="Aircraft">
                            <ListItem
                              button
                              aria-haspopup="true"
                              aria-controls="lock-menu"
                              aria-label="Aircraft"
                              onClick={handleClickListItem}
                              disabled={props.role === "User" ? true : false}
                            >
                              <ListItemIcon>
                                <LocalAirport />
                              </ListItemIcon>
                              <ListItemText
                                primary="Aircraft"
                                secondary={
                                  aircrafts ? aircrafts[selectedAircraftIndex].aircraft_name : null
                                }
                              />
                            </ListItem>
                          </List>
                          <Menu
                            id="lock-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                          >
                            {aircrafts && aircrafts.map((aircraft, index) => (
                              <MenuItem
                                key={aircraft.aircraft_name+index}
                                disabled={aircraft.disabled}
                                selected={index === selectedAircraftIndex}
                                onClick={(event) =>
                                  handleAircraftSelectClick(event, index)
                                }
                              >
                                {aircraft.aircraft_name}
                              </MenuItem>
                            ))}
                          </Menu>
                        </Grid>
                        {/* Airspace menu */}
                        <Grid item xs={6}>
                          <List component="nav" aria-label="Airspace">
                            <ListItem
                              button
                              aria-haspopup="true"
                              aria-controls="lock-menu"
                              aria-label="Airspace"
                              onClick={handleClickListItem2}
                              disabled={props.role === "User" ? true : false}
                            >
                              <ListItemIcon>
                                <Room />
                              </ListItemIcon>
                              <ListItemText
                                primary="Location"
                                secondary={
                                  locations ? locations[selectedLocationIndex].location_name : null
                                }
                              />
                            </ListItem>
                          </List>
                          <Menu
                            id="lock-menu"
                            anchorEl={anchorEl2}
                            keepMounted
                            open={Boolean(anchorEl2)}
                            onClose={handleMenuClose2}
                          >
                            {locations && locations.map((location, index) => (
                              <MenuItem
                                key={location.location_name}
                                disabled={location.disabled}
                                selected={index === selectedLocationIndex}
                                onClick={(event) =>
                                  handleLocationSelectClick(event, index)
                                }
                              >
                                {location.location_name}
                              </MenuItem>
                            ))}
                          </Menu>
                        </Grid>
                      </Grid>
                      {/* Pilots */}
                      <Grid container item direction="row">
                        <Autocomplete
                          multiple
                          id="tags-standard"
                          options={pilots}
                          getOptionLabel={(option) => option.name}
                          onChange={handlePilots}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              variant="standard"
                              label="Pilots"
                              placeholder="Add pilots"
                              InputLabelProps={{
                                shrink: true,
                              }}
                              disabled={props.role === "User" ? true : false}
                            />
                          )}
                          className={classes.pilotStyle}
                          value={selectedPilots ? selectedPilots : []}
                          disabled={props.role === "User" ? true : false}
                        />
                      </Grid>
                      {/* Buttons */}
                      <Grid container item direction="row">
                        <Chip
                          type="more options"
                          label="More options"
                          color="default"
                          clickable
                          onClick={toggleOptions}
                          className={classes.smallSubmitBtn}
                        />
                        <Chip
                          type="submit"
                          label="Save"
                          color="primary"
                          clickable
                          onClick={onSubmit}
                          className={classes.smallSubmitBtn}
                        />
                      </Grid>
                    </Grid>
                  </form>
                </Paper>
              </Fade>
            </Modal>
          )}
        </>
      ) : null}
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    role: state.loggedReducer.role,
    locations: state.locationReducer,
    aircrafts: state.aircraftReducer,
    airacraft_models: state.aircraftmodelReducer
  };
};
const mapDispatchToProps = (state) => {
  return {
    setFlights: setFlights,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MasterModal);
