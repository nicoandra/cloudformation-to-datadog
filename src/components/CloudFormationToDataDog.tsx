import React, {useState, useEffect} from 'react';
import Form from 'react-bootstrap/Form';

import JSONPretty from 'react-json-pretty';

import Accordion from 'react-bootstrap/Accordion';
import ListGroup from 'react-bootstrap/ListGroup';



const LOG_GROUP_MAX_RETENTION_DAYS = 14 
enum OutputMessageLevel {
    Info,
    Warning,
    Alert,
    Ok
}
class OutputMessage {
    level: OutputMessageLevel;
    cloudFormationKey: string;
    message: string;

    constructor(level: OutputMessageLevel, cloudFormationKey: string, message: string) {
        this.level = level;
        this.cloudFormationKey = cloudFormationKey;
        this.message = message;
    }
} 

type CloudFormationLogGroupProperties = {
    LogGroupName: string
    RetentionInDays?: number

}

type CloudFormationResource = {
    Type: string;
    Properties: CloudFormationLogGroupProperties;
    CloudFormationKey?: string // Used only for rendering purposes
}

type CloudFormationTemplate = {
    Resources: Record<string, CloudFormationResource>;
}

function CloudFormationToDataDog() {
    const [rawTemplate, setRawTemplate] = useState('')
    const [template, setTemplate] = useState<false|CloudFormationTemplate>(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [showParsedTemplate, setShowParsedTemplate] = useState(false)
    const [showLogGroups, setShowLogGroups] = useState(true)
    const [showSuccessMessages, setShowSuccessMessages] = useState(true)


    useEffect(() => {
        try {
            const v = JSON.parse(rawTemplate)
            setTemplate(v)
            setErrorMessage('')
        } catch(Exception) {
            setErrorMessage("The template does not contain valid JSON")
            setTemplate(false)

        }
    }, [rawTemplate])


    const JsonViewer = () => {
        if(!showParsedTemplate) return <></>
        return <Accordion.Item eventKey="template-json-viewer">
            <Accordion.Header>Parsed Template</Accordion.Header>
            <Accordion.Body>
                {template ? <JSONPretty id="json-pretty" data={template}></JSONPretty> : "Please paste the CloudFormation Template in the box above."}
            </Accordion.Body>
            </Accordion.Item>
    }


    return (<>
        <Form>
            <Form.Group className="mb-3" controlId="form.CloudFormationTemplateTextArea">
                <Form.Label>CloudFormation Template</Form.Label>
                <Form.Control as="textarea" rows={20} onChange={(e)=> setRawTemplate(e.target.value.trim())}/>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Show parsed template</Form.Label>
                <Form.Switch
                    checked={showParsedTemplate} 
                    onChange={(e) => setShowParsedTemplate(e.target.checked)}
                    />
                    The template is {rawTemplate.length} characters long.<br />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label>Show success messages</Form.Label>
                <Form.Switch
                    checked={showSuccessMessages} 
                    onChange={(e) => setShowSuccessMessages(e.target.checked)}
                    />
            </Form.Group>

        </Form>


        <Accordion defaultActiveKey="0">
            {JsonViewer()}
            <LogGroups showLogGroups={showLogGroups} template={template} showSuccessMessages={showSuccessMessages}/> 
        </Accordion>
        </>
    )

}

const filterResourcesByType: (template:CloudFormationTemplate|false, resourceType: string) => CloudFormationResource[] = (template, resourceType) => {
    if(template === false) return []
    return Object.keys(template.Resources || {}).map((id: string) => {return {...template.Resources[id], CloudFormationKey: id}}).filter(r => r.Type === resourceType)
}


const LogGroups : React.FC<{template: CloudFormationTemplate|false, showLogGroups: boolean, showSuccessMessages: boolean}> = ({template, showLogGroups, showSuccessMessages}) => {
    if(!showLogGroups || template === false) return (<></>)
    
    const logGroups = filterResourcesByType(template, "AWS::Logs::LogGroup")
    
    const messages : OutputMessage[] = logGroups.map((logGroup) => {
        if (logGroup.Properties.RetentionInDays !== undefined && logGroup.Properties.RetentionInDays <= LOG_GROUP_MAX_RETENTION_DAYS) {
            return new OutputMessage(OutputMessageLevel.Ok, logGroup.CloudFormationKey || logGroup.Properties.LogGroupName, `LogGroup ${logGroup.Properties.LogGroupName} has a maximum retention period configured.`)
        }
        return new OutputMessage(OutputMessageLevel.Warning, logGroup.CloudFormationKey || logGroup.Properties.LogGroupName, `LogGroup ${logGroup.Properties.LogGroupName} does not have a maximum retention limit or it exceeds the maximum of ${LOG_GROUP_MAX_RETENTION_DAYS} days.`)
    })


        return <Accordion.Item eventKey="log-groups">
            <Accordion.Header>Log Groups</Accordion.Header>
            <Accordion.Body>
                <ListMessages messages={messages} showSuccessMessages={showSuccessMessages} />
            </Accordion.Body>
        </Accordion.Item>
}


const ListMessages: React.FC<{messages: OutputMessage[], showSuccessMessages: boolean}> = ({messages, showSuccessMessages}) => {
    return <ListGroup>
        {messages.filter((m) => showSuccessMessages || m.level !== OutputMessageLevel.Ok).map(m => {

            if(m.level === OutputMessageLevel.Ok) {
                return  <ListGroup.Item variant="success"><b>{m.cloudFormationKey}</b>: {m.message}</ListGroup.Item>
            }

            if(m.level === OutputMessageLevel.Warning) {
                return  <ListGroup.Item variant="warning"><b>{m.cloudFormationKey}</b>: {m.message}</ListGroup.Item>
            }

            if(m.level === OutputMessageLevel.Alert) {
                return  <ListGroup.Item variant="danger"><b>{m.cloudFormationKey}</b>: {m.message}</ListGroup.Item>
            }
        })}
    </ListGroup>
}




export default CloudFormationToDataDog