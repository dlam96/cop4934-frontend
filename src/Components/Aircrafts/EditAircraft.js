import React, { useState } from 'react';
import {
  Grid,
  Paper,
  makeStyles,
  TextField,
  Button,
  Select,
  FormControl,
  Typography,
} from "@material-ui/core";
import {
  Save,
} from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(2),
    width: '100%',
  },
  fixedInfo: {
    height: '100%',
    width: '100%',
    paddingTop: "50px",
    padding: theme.spacing(2),
  },
  crewPos: {
    width: '100%',
  },
  buttons: {
    paddingTop: theme.spacing(4),
  },
  saveBt: {
    marginRight: "10px",
  },
  posInfo: {
    margin: theme.spacing(1),
    paddingLeft: '50%',
  },
}));

export default function EditAircraft(props) {
  const classes = useStyles();
  const { aircraftModels } = props;
  const [aircraft, setAircraft] = useState(props.aircraft);

  const getModelName = ( aircraft = null ) => {
    let index = aircraftModels.findIndex((element) => element.model_uuid === aircraft.model_uuid)
    return aircraftModels[index].model_name;
  }

  return (
    <Paper className={classes.fixedInfo} variant="outlined">
      <Grid container item direction='column' spacing={2}>

        {/* Aircraft Info */}
        <Grid container item direction='row'>
          <Grid item xs={4} align='right'>Aircraft ID</Grid>
          <Grid item xs={1} />
          <Grid item xs={4} align='start'>{ aircraft.aircraft_uuid }</Grid>
        </Grid>
        <Grid container item direction='row'>
          <Grid item xs={4} align='right'>Aircraft Model</Grid>
          <Grid item xs={1} />
          <Grid item xs={4} align='start'>{ getModelName(aircraft) }</Grid>
        </Grid>
        <Grid container item direction='row'>
          <Grid item xs={4} align='right'>Status</Grid>
          <Grid item xs={1} />
          <Grid item xs={4} alight='start'>
            <FormControl size='small'>
              <Select
                native
                value={aircraft.status}
                onChange={(e) =>
                  {
                    let newAircraft = {...aircraft};
                    newAircraft['status'] = e.target.value;
                    setAircraft(newAircraft)
                  }
                }
              >
                <option value="Unavailable">Unavailable</option>
                <option value="Available">Available</option>
                <option value="Maitenance">Maitenance</option>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Save and Cancel buttons */}
        <Grid container item>
          <Grid item xs={12} align="center" className={classes.buttons}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Save />}
              className={classes.saveBt}
              onClick={()=>props.handleEdit(aircraft)}
            >
              Save
            </Button>
            <Button
              variant="contained"
              onClick={()=>props.handleEdit()}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>

      </Grid>
    </Paper>
  )

}