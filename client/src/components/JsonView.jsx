import React, { useEffect, useState, useRef } from "react"

import styles from "../style/site.module.css"
import { 
    InputText,
    ActionButton,
    BackButton, 
    JsonRow, 
    FileLabel, 
    JsonTextArea, 
    JsonInfoButton, 
    JsonInfo, 
    ValidationMessage } from "../style/styled-components"
import { 
    MobileBackButton, 
    MobileJsonLabel, 
    MobileJsonInfo, 
    MobileJsonInfoButton, 
    MobileActionButton,
    MobileValidationMessage,
    MobileJsonTextArea, 
    MobileFileLabel} from "../style/styled-mobile-components"
import { motion } from "framer-motion"
import styled from "styled-components"
import { DataTable, ReadingChart, Loading } from "../components"
import api from "../api"
import { v4 as uuidv4 } from "uuid"
import { useSnackbar } from "react-simple-snackbar"
import Options from "../style/options.js"
import Modal from "react-bootstrap/Modal"
import Select from "react-select"

const JsonView = (callback) => {
    const didMount = useRef(true)
    const [helper, invokeHelper] = useState(false)
    const [mouseOver, setMouseOver] = useState(false)
    const [file, setFile] = useState()
    const [fileName, setFileName] = useState("< NAME >")
    const [showButtons, setShowButtons] = useState(false)
    const [previewView, setPreviewView] = useState(false)
    const [labelCount, setLabelCount] = useState(1)
    const [rowsCount, setRowsCount] = useState(2)
    const [bundleName, setBundleName] = useState("")
    const [sendWithBundle, setSendWithBundle] = useState(false)
    const [showBundleForm, setShowBundleForm] = useState(false)
    const [timestamps, setTimestamps] = useState([])
    const [milliSeconds, setMilliseconds] = useState([])
    const [sensorLabels, setSensorLabels] = useState([])
    const [name, setName] = useState("")
    const [sensorValues, setSensorValuess] = useState([])
    const [sensorValue1, setSensorValue1] = useState([])
    const [sensorValue2, setSensorValue2] = useState([])
    const [sensorValue3, setSensorValue3] = useState([])
    const [showInfoSpan, setShowInfoSpan] = useState(true)
    const [renderChart, setRenderChart] = useState(true)
    const [values, setValues] = useState()
    const [labels, setLabels] = useState([])
    const [dismiss, setDismiss] = useState(false)
    const [loading, setLoading] = useState(false)
    const [json, setJson] = useState("")
    const [showInfo, setShowInfo] = useState(false)
    const [invalidJson, setInvalidJson] = useState(false)
    var optionsInstance = new Options()
    const [openSuccessSnackbar, closeSuccessSnackbar] = useSnackbar(optionsInstance.successSnackbarOptions)
    const [openErrorSnackbar, closeErrorSnackbar] = useSnackbar(optionsInstance.errorSnackbarOptions)
    const [showBundleModal, setShowBundleModal] = useState(false)
    const [bundleSelect, setBundleSelect] = useState([])
    const [selectValue, setSelectValue] = useState("")
    const [readingBundles, setReadingBundles] = useState([])
    const [width, setWidth] = useState(window.innerWidth)
    const breakpoint = 620;

    useEffect(() => {
        async function getReadingBundles() {
            let response = { status: "" }
            try {
                const userModel = JSON.parse(localStorage.getItem("userModel"))
                response = await api.getBundlesByUserId(userModel._id)
            } catch (err) {
                console.log("bundles not found")
            } finally {
                if (response.status == 200) {
                    setReadingBundles(response.data.data)
                }
            }
        }

        if (didMount.current) {
            getReadingBundles()
            didMount.current = false
            return
        }
        isJsonString(json)
    }, [json, helper])

    useEffect(() => {
        setRenderChart(true)
    }, [renderChart])

    useEffect(() => {
        const handleWindowResize = () => setWidth(window.innerWidth)
        window.addEventListener("resize", handleWindowResize)
    
        return () => window.removeEventListener("resize", handleWindowResize)
    }, [])

    useEffect(() => {
        if (bundleName)
            setSendWithBundle(true)
        else
            setSendWithBundle(false)
    }, [bundleName])

    const joinSensorValues = (number) => {
        sensorValues[number] = sensorValue1[number]+","+sensorValue2[number]+","+sensorValue3[number]
        sensorValues[number] = sensorValues[number].replace("undefined", "")
        sensorValues[number] = sensorValues[number].replace("undefined", "")
    }

    const handleBackClick = async () => {
        setDismiss(true)
        await new Promise(r => setTimeout(r, 500))
        callback.onBack()
    }

    const handleMouseOver = () => {
        setMouseOver(true)
    }

    const handleMouseOut = () => {
        setMouseOver(false)
    }

    const handlePreviewClick = () => {
        invokeHelper(helper + 1)
        setPreviewView(true)
    }

    const handleSensorValue1Change = (event, number) => {
        values[0][number] = event
        setValues(values)
        setRenderChart(false)      
    }

    const handleSensorValue2Change = (event, number) => {
        values[1][number] = event
        setValues(values)
        setRenderChart(false)      
    }

    const handleSensorValue3Change = (event, number) => {
        values[2][number] = event
        setValues(values)
        setRenderChart(false)      
    }

    const handleSensorLabelChange = (event, number) => {
        labels[number] = event
        setLabels(labels)
        setRenderChart(false) 
    }

    const handleMillisecondsChange = (event, number) => {
        milliSeconds[number] = event
        setMilliseconds(milliSeconds)
        setRenderChart(false) 
    }

    const handleTimestampChange = (event, number) => {
        timestamps[number] = event
        setTimestamps(timestamps)
        setRenderChart(false) 
    }

    function isJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            setFileName("< NAME >")
            setShowButtons(false)
            setInvalidJson(true)
            console.log("nie json")
            return false
        }
        setInvalidJson(false)
        setLoading(true)
        console.log("not done")
        const parsedJson = JSON.parse(json)
        const jsonHeaders = Object.keys(parsedJson[0])
        const jsonLabels = jsonHeaders.slice(3)
        setFileName(Object.entries(parsedJson[0]).slice(0,1).map(entry => entry[1]))
        setRowsCount(parsedJson.length)
        setLabelCount(jsonHeaders.length - 3)
        for (let i = 0; i < parsedJson.length; i++) {
            timestamps[i] = Object.entries(parsedJson[i]).slice(1,2).map(entry => entry[1])[0]
            milliSeconds[i] = Object.entries(parsedJson[i]).slice(2,3).map(entry => entry[1])[0]
            sensorValue1[i] = Object.entries(parsedJson[i]).slice(3,4).map(entry => entry[1])
            sensorValue2[i] = Object.entries(parsedJson[i]).slice(4,5).map(entry => entry[1])
            sensorValue3[i] = Object.entries(parsedJson[i]).slice(5).map(entry => entry[1])
            joinSensorValues(i)
        }
        setSensorLabels({...sensorLabels, 0: jsonLabels[0], 1: jsonLabels[1], 2: jsonLabels[2]})  
        const mixed = [[].concat.apply([], sensorValue1),[].concat.apply([], sensorValue2),[].concat.apply([], sensorValue3)]
        setValues(mixed)
        var merged = sensorLabels[0]+","+sensorLabels[1]+","+sensorLabels[2]
        merged  = merged.replace("undefined", "")
        merged  = merged.replace("undefined", "")
        setLabels(merged.split(","))
        console.log("done")
        setLoading(false)
        setShowButtons(true)
        setShowInfoSpan(false)
        console.log("jsooon")
        return true
    }

    const handleTextAreaChange = (event) => {
        setJson(event.target.value)
    }

    const handleSendClick = async () => {
        const userModel = JSON.parse(localStorage.getItem("userModel"))
        const userId = userModel._id
        let bundleId = 0
        if (sendWithBundle) {
            let getResponse = { status: "" }
            try {
                getResponse = await api.getBundleByName(selectValue)
            } catch (err) {
                
            } finally {
                if (getResponse.status == 200 && bundleName == "") {
                    bundleId = getResponse.data.data._id
                } else {
                    let name = bundleName
                    const groupId = 0
                    const isShared = false
                    var bundle = { name, userId, groupId, isShared }
                    var createResponse = await api.createBundle(bundle)
                    if (createResponse.status == 201)
                    bundleId = createResponse.data.id
                }
            }
        }
        setLoading(true)
        setShowButtons(false)
        console.log("started")
        joinSensorValues()
        let sensorlabels = sensorLabels[0]+","+sensorLabels[1]+","+sensorLabels[2]
        sensorlabels = sensorlabels.replace("undefined", "")
        sensorlabels = sensorlabels.replace("undefined", "")
        const uuid = uuidv4()
        const name = fileName[0]
        let successes = 0;
        for (let i = 0; i < rowsCount; i++)
        {
            const timestamp = timestamps[i]
            console.log(timestamp)
            const milliseconds = milliSeconds[i]
            console.log(milliseconds)
            const sensorvalues = sensorValues[i]
            console.log(sensorvalues)
            const sensordata = { uuid, userId, name, bundleId, timestamp, milliseconds, sensorlabels, sensorvalues }
            console.log(sensordata)
            const response = await api.insertReading(sensordata)
            if (response.status == 201)
            {
                successes++;
            }
        }

        setLoading(false)

        if (successes == rowsCount) {
            openSuccessSnackbar("Reading created successfully!")
            callback.onInsert()
            await new Promise(r => setTimeout(r, 1000))
            window.location.href = "/sensordata/list"
        } else
            openErrorSnackbar("Something went wrong while creating data")
    }

    const handleChangeBundleName = event => {
        setBundleName(event.target.value)
    }

    const handleSendToBundle = () => {
        invokeHelper(helper + 1)
        setPreviewView(true)     
        setShowBundleForm(true)
        setShowButtons(false)
        setShowInfoSpan(false)
    }

    const handleShowBundleModal = () => {
        setSendWithBundle(true)
        setShowBundleModal(true)
        const options = []
        readingBundles.forEach(bundle => {
            options.push({ value: bundle._id, label: bundle.name })
        })
        setBundleSelect(options)
    }
    
    const handleOnSelectChange = event => {
        setSelectValue(event.label)
    }

    const handleCloseBundleModal = () => {
        setSendWithBundle(false)
        setShowBundleModal(false)
    }

    return (
        <>
        { width > breakpoint ?
        <motion.div
            initial = {{ opacity: 1, y: 0 }}
            animate = {{ opacity: dismiss ? 0 : 1, y: dismiss ? 500 : 0 }}
            transition = {{ duration: 0.4 }}> 
            <motion.div
                initial = {{ opacity: 0 }}
                animate = {{ opacity: 1 }}
                transition = {{ duration: 0.4 }}> 
                <BackButton onClick={handleBackClick}/>
            </motion.div>
            <>
            <motion.div
                initial = {{ opacity: 0, x: 300}}
                animate = {{ opacity: 1, x: previewView ? "-60%" : 0 }}
                transition = {{ duration: 0.4 }}>
                <JsonRow>
                    <motion.div
                        initial = {{ "width": "80%"}}
                        animate = {{ opacity: previewView? 0 : 1, x: previewView ? "-100%" : "0%" }}>
                        <JsonTextArea id="test-json-area" value={json} onChange={handleTextAreaChange}/>
                    </motion.div>
                    <FileLabel>
                        {fileName} 
                        { showInfoSpan ?
                        <>
                            <JsonInfoButton onMouseOver={() => setShowInfo(true)} onMouseOut={() => setShowInfo(false)}/>
                            <motion.div
                                initial = {{ opacity: 0 }}
                                animate = {{ opacity: showInfo ? 1 : 0 }}>
                                <JsonInfo>
                                    To send the reading correctly, every single JSON object should contain properties in the following order:
                                    <br/> "name", "timestamp", "milliseconds", "label_1", "label_2" (optional), "label_3" (optional)
                                </JsonInfo>
                            </motion.div>
                        </>
                        : null }
                        { showBundleForm ?
                            <>
                                <p className={styles.BundleFileLabel}>Bundle:</p>
                                <InputText type="text" value={bundleName} onChange={handleChangeBundleName} className={styles.TypeLabel} />
                                <motion.div
                                    initial = {{ opacity: 0, x: 100}}
                                    animate = {{ opacity: sendWithBundle ? 1 : 0, x: sendWithBundle ? 0 : 100 }}
                                    transition = {{ duration: 0.4 }}>
                                    <ActionButton id="test-send-button" onClick={handleSendClick}>
                                        SEND
                                    </ActionButton>
                                </motion.div>
                            </>
                        : null }
                        { loading ? <Loading/> : null}
                        { showButtons ?
                        <>
                            <motion.div
                                initial = {{ opacity: 0, x: 100}}
                                animate = {{ opacity: showButtons && !previewView ? 1 : 0, x: showButtons ? 0 : 100 }}
                                transition = {{ duration: 0.4 }}>                    
                                <ActionButton id="test-preview-button" onClick={handlePreviewClick}>
                                    PREVIEW
                                </ActionButton>
                            </motion.div>
                            { !showBundleForm ?
                            <>
                                <motion.div
                                    initial = {{ opacity: 0, x: 100}}
                                    animate = {{ opacity: showButtons ? 1 : 0, x: showButtons ? 0 : 100, y: previewView ? "-100%" : 0 }}
                                    transition = {{ duration: 0.4 }}>
                                    <ActionButton id="test-send-button" onClick={handleSendClick}>
                                        SEND AS SINGLE
                                    </ActionButton>
                                </motion.div>
                                <motion.div
                                    initial = {{ opacity: 0, x: 100}}
                                    animate = {{ opacity: showButtons ? 1 : 0, x: showButtons ? 0 : -500, y: previewView ? -50 : 0 }}
                                    transition = {{ duration: 0.4 }}>
                                    <ActionButton onClick={handleShowBundleModal}>
                                        SEND TO BUNDLE
                                    </ActionButton>
                                </motion.div>
                            </>
                            : null }
                        </>
                        : null }
                    </FileLabel>
                </JsonRow>
                <motion.div
                    initial = {{ opacity: 0 }}
                    animate = {{ opacity: invalidJson ? 1 : 0 }}>
                    <ValidationMessage className={styles.JsonValid}>
                        The entered code is not valid JSON
                    </ValidationMessage>
                </motion.div>
            </motion.div>
            </>
            <>           
            </>
            { previewView ?
                <>
                <motion.div
                    initial = {{ opacity: 0 }}
                    animate = {{ opacity: previewView ? 1 : 0 }}
                    transition = {{ delay: 0.5, duration: 0.6}}>
                    { renderChart ? 
                    <ReadingChart
                        labels={labels} 
                        milliseconds={milliSeconds} 
                        values={values}
                        className={styles.PreviewChart}/>
                    : null }
                </motion.div> 
                <motion.div
                    initial = {{ opacity: 0, y: 200}}
                    animate = {{ opacity: previewView ? 1 : 0, y: previewView ? "-20%" : 200 }}
                    transition = {{ delay: 0.5, duration: 0.4}}>
                    <DataTable
                        passedLabels={sensorLabels}
                        passedRowsCount={rowsCount}
                        passedLabelCount={labelCount}
                        passedTimestamps={timestamps}
                        passedMilliSeconds={milliSeconds}
                        passedSensorValue1={sensorValue1}
                        passedSensorValue2={sensorValue2}
                        passedSensorValue3={sensorValue3}
                        onSensorValue1Change={handleSensorValue1Change}
                        onSensorValue2Change={handleSensorValue2Change}
                        onSensorValue3Change={handleSensorValue3Change}
                        onSensorLabelChange={handleSensorLabelChange}
                        onMillisecondsChange={handleMillisecondsChange}
                        onTimestampChange={handleTimestampChange}/>
                </motion.div> 
                </>
                : null }
            </motion.div>
            
            :

            <motion.div
                initial = {{ opacity: 1, y: 0 }}
                animate = {{ opacity: dismiss ? 0 : 1, y: dismiss ? 500 : 0 }}
                transition = {{ duration: 0.4 }}> 
                <motion.div
                    initial = {{ opacity: 0 }}
                    animate = {{ opacity: 1 }}
                    transition = {{ duration: 0.4 }}> 
                    <MobileBackButton onClick={handleBackClick}/>
                </motion.div>
                <>
                <motion.div
                    initial = {{ opacity: 0, x: 300}}
                    animate = {{ opacity: 1, x: previewView ? "0%" : 0, y: previewView ? "0%" : 0 }}
                    transition = {{ duration: 0.4 }}>
                        { !previewView ?
                        <>
                        <motion.div
                            initial = {{ "width": "80%"}}
                            animate = {{ opacity: previewView? 0 : 1, x: previewView ? "-100%" : "0%" }}>
                            <MobileJsonTextArea id="test-json-area" value={json} onChange={handleTextAreaChange}/>
                        </motion.div>
                        <motion.div
                            initial = {{ opacity: 0 }}
                            animate = {{ opacity: invalidJson ? 1 : 0 }}>
                            <MobileValidationMessage className={styles.JsonValid}>
                                The entered code is not valid JSON
                            </MobileValidationMessage>
                        </motion.div>
                        </>
                        : null }
                        <MobileFileLabel style={{ marginTop: "5vh" }}>
                            {fileName} 
                            { showBundleForm ?
                                <>
                                    <p style={{ marginTop: "5vh" }} className={styles.BundleFileLabel}>Bundle:</p>
                                    <InputText type="text" value={bundleName} onChange={handleChangeBundleName} className={styles.TypeLabel} style={{ width: "80%", fontSize: "8vw", marginLeft: "10%", borderBottom: "1px solid" }} />
                                    <motion.div
                                        initial = {{ opacity: 0, x: 100}}
                                        animate = {{ opacity: sendWithBundle ? 1 : 0, x: sendWithBundle ? 0 : 100 }}
                                        transition = {{ duration: 0.4 }}>
                                        <MobileActionButton className={styles.MobileCenterButtons} id="test-send-button" onClick={handleSendClick}>
                                            SEND
                                        </MobileActionButton>
                                    </motion.div>
                                </>
                            : null }
                            { loading ? <Loading/> : null}
                            { showButtons ?
                            <>
                                <motion.div
                                    initial = {{ opacity: 0, x: 100}}
                                    animate = {{ opacity: showButtons && !previewView ? 1 : 0, x: showButtons ? 0 : 100, y: showButtons ? "-50%" : 0 }}
                                    transition = {{ duration: 0.4 }}>                    
                                    <MobileActionButton className={styles.MobileCenterButtons} id="test-preview-button" onClick={handlePreviewClick}>
                                        PREVIEW
                                    </MobileActionButton>
                                </motion.div>
                                { !showBundleForm ?
                                <>
                                    <motion.div
                                        initial = {{ opacity: 0, x: 100}}
                                        animate = {{ opacity: showButtons ? 1 : 0, x: showButtons ? 0 : 100, y: previewView ? "-100%" : showButtons ? "-150%" : 0 }}
                                        transition = {{ duration: 0.4 }}>
                                        <MobileActionButton className={styles.MobileCenterButtons} id="test-send-button" onClick={handleSendClick}>
                                            SEND AS SINGLE
                                        </MobileActionButton>
                                    </motion.div>
                                    <motion.div
                                        initial = {{ opacity: 0, x: 100}}
                                        animate = {{ opacity: showButtons ? 1 : 0, x: showButtons ? 0 : -500, y: previewView ? -50 : showButtons ? "-250%" : 0 }}
                                        transition = {{ duration: 0.4 }}>
                                        <MobileActionButton className={styles.MobileCenterButtons} onClick={handleShowBundleModal}>
                                            SEND TO BUNDLE
                                        </MobileActionButton>
                                    </motion.div>
                                </>
                                : null }
                            </>
                            : null }
                        </MobileFileLabel>
                </motion.div>
                </>
                <>           
                </>
                { previewView ?
                    <>
                    <motion.div
                        initial = {{ opacity: 0 }}
                        animate = {{ opacity: previewView ? 1 : 0, y: previewView ? "-20%" : 0 }}
                        transition = {{ delay: 0.5, duration: 0.6}}>
                        { renderChart ? 
                        <ReadingChart
                            labels={labels} 
                            milliseconds={milliSeconds} 
                            values={values}
                            className={styles.PreviewChart}/>
                        : null }
                    </motion.div> 
                    <motion.div
                        initial = {{ opacity: 0, y: 200}}
                        animate = {{ opacity: previewView ? 1 : 0, y: previewView ? "0%" : 200 }}
                        transition = {{ delay: 0.5, duration: 0.4}}>
                        <DataTable
                            passedLabels={sensorLabels}
                            passedRowsCount={rowsCount}
                            passedLabelCount={labelCount}
                            passedTimestamps={timestamps}
                            passedMilliSeconds={milliSeconds}
                            passedSensorValue1={sensorValue1}
                            passedSensorValue2={sensorValue2}
                            passedSensorValue3={sensorValue3}
                            onSensorValue1Change={handleSensorValue1Change}
                            onSensorValue2Change={handleSensorValue2Change}
                            onSensorValue3Change={handleSensorValue3Change}
                            onSensorLabelChange={handleSensorLabelChange}
                            onMillisecondsChange={handleMillisecondsChange}
                            onTimestampChange={handleTimestampChange}/>
                    </motion.div> 
                    </>
                    : null }
                </motion.div> }

                <Modal show={showBundleModal} onHide={handleCloseBundleModal} animation={true} centered backdrop="static" backdropClassName={styles.ModalBackdrop}>
                    <Modal.Header closeButton>
                        <h4>Choose destination bundle</h4>
                    </Modal.Header>
                    <Modal.Body>
                        <Select options={bundleSelect} onChange={handleOnSelectChange} />
                        { width > breakpoint ?
                        <>
                            <p>Or create a new one:</p>
                            <InputText type="text" value={bundleName} onChange={handleChangeBundleName} className={styles.TypeLabel}/>
                        </>
                        :
                        <>
                            <p class="mt-5 mb-5">Or create a new one:</p>
                            <InputText style={{ fontSize: "5vw" }} type="text" value={bundleName} onChange={handleChangeBundleName} className={styles.TypeLabel}/>
                        </> }
                    </Modal.Body>
                    <Modal.Footer>
                        <button onClick={handleCloseBundleModal} className={styles.CancelButton}>
                            Cancel
                        </button>
                        <button onClick={(e) => {handleSendClick(e)}} className={styles.DeleteButton}>
                            Send
                        </button>
                    </Modal.Footer>
                </Modal>
        </>
    )
}

export default JsonView