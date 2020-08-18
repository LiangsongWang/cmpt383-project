import React, { useState } from 'react';
import clsx from 'clsx';
import FileUpload from './components/FileUpload';
import fileService from "./services/fileService"
import rpcService from "./services/rpcService"
import PredictImage from './components/PredictImage';
import UploadSuccess from './components/UploadSuccess';
import AndroidIcon from '@material-ui/icons/Android';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fab from '@material-ui/core/Fab';
import CheckIcon from '@material-ui/icons/Check';
import { makeStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import './styles/app.css'

const useStyles = makeStyles((theme) => ({
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative',
  },
  buttonSuccess: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700],
    },
  },
  fabProgress: {
    color: green[500],
  },
  buttonProgress: {
    color: green[500],
  },
}));


const App = () => {
  const classes = useStyles();
  const [fileOne, setFileOne] = useState('');
  const [filenameOne, setFilenameOne] = useState('');
  const [fileTwo, setFileTwo] = useState('');
  const [filenameTwo, setFilenameTwo] = useState('');
  const [classNames, setClassNames] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [modelTraining, setModelTraining] = useState(false);
  const [modelSuccess, setModelSuccess] = useState(false);

  const buttonClassname = clsx({
    [classes.buttonSuccess]: modelSuccess,
  });

  const handleFileChange = (event, setFile, setFilename) => {
    const newFile = event.target.files[0];
    if (newFile !== undefined) {
      setFile(newFile);
      setFilename(newFile.name);
    }
  }

  const handleUpload = (event, file) => {
    if (!file) {
      window.alert("Error: Please select a zip file to upload.")
      return
    }
    event.preventDefault();
    console.log(file);
    setUploadSuccess(false)
    fileService.uploadFile(file).then(() => setUploadSuccess(true));
  }

  const trainModel = (event, filenameOne, filenameTwo, setClassNames) => {
    // Makes a POST request to Go Server
    // Go Server makes a RPC Call to Python server. 
    // Python Server downloads files from GO server and trains models witth those files
    // Then serves the model with TF serving
    if (!fileOne || !fileTwo) {
      window.alert("Error: Please upload zip files for both classes before training.")
      return;
    }

    setModelTraining(true);
    setModelSuccess(false);
    event.preventDefault();

    rpcService.trainModel(filenameOne, filenameTwo).then((response) => {
      console.log(response)
      setClassNames(response.class_names)
      setModelTraining(false);
      setModelSuccess(true);
    })
  }

  return (
    <div className="app-container">
      <h1> Welcome to AutoML</h1>
      <p>A web application that automatically trains a binary image classifier for two sets of images.</p>

      <div className="uploadFiles">
        <div className="classFiles">
          <h2>Upload Zip File for Class 1</h2>
          <FileUpload handleFileChange={(e) => handleFileChange(e, setFileOne, setFilenameOne)} handleUpload={(e) => handleUpload(e, fileOne)} />
        </div>
        <div className="classFiles">
          <h2> Upload Zip File for Class 2</h2>
          <FileUpload handleFileChange={(e) => handleFileChange(e, setFileTwo, setFilenameTwo)} handleUpload={(e) => handleUpload(e, fileTwo)} />
        </div>
      </div>

      <div id="train-button-wrapper">
        <div className={classes.wrapper}>
          <Fab
            variant="extended"
            color="inherit"
            className={buttonClassname}
            onClick={(e) => trainModel(e, filenameOne, filenameTwo, setClassNames)}
            disabled={modelTraining}
          >
            {modelSuccess ? <CheckIcon style={{ margin: '0.25em' }} /> : <AndroidIcon style={{ margin: '0.25em' }} />}
            Train Model
          </Fab>
        </div>
        {modelTraining && <div><CircularProgress style={{ margin: '2em' }} size={48} className={classes.fabProgress} /><p>Training Model...</p></div>}
        {modelSuccess && <div id="model-status"><strong>Model Training Complete!</strong></div>}
      </div>

      <PredictImage classNames={classNames}></PredictImage>
      {uploadSuccess && <UploadSuccess></UploadSuccess>}
    </div>
  );
}

export default App;
