import React, {useState, useEffect} from 'react';
import Form from 'react-bootstrap/Form';

import JSONPretty from 'react-json-pretty';

import Accordion from 'react-bootstrap/Accordion';


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

        </Form>


        <Accordion defaultActiveKey="0">
            {JsonViewer()}
            <LogGroups showLogGroups={showLogGroups} template={template} /> 
        </Accordion>
        </>
    )

}

const filterResourcesByType: (template:CloudFormationTemplate|false, resourceType: string) => CloudFormationResource[] = (template, resourceType) => {
    if(template === false) return []
    return Object.keys(template.Resources || {}).map((id: string) => {return {...template.Resources[id], CloudFormationKey: id}}).filter(r => r.Type === resourceType)
}


const LogGroups : React.FC<{template: CloudFormationTemplate|false, showLogGroups: boolean}> = ({template, showLogGroups}) => {
    if(!showLogGroups || template === false) return (<></>)
    
    const logGroups = filterResourcesByType(template, "AWS::Logs::LogGroup")
    
    console.log(logGroups)

    const messagesByLogGroup : string[] = logGroups.reduce((prev, current) => {
        if(current.Properties.RetentionInDays !== undefined && current.Properties.RetentionInDays <= 14) return prev 
        prev.push(`${current.CloudFormationKey} - ${current.Properties.LogGroupName}: Missing RetentionInDays. Consider using the log-retention Serverless Plugin`)
        return prev
    }, [] as string[])


        return <Accordion.Item eventKey="log-groups">
            <Accordion.Header>Log Groups</Accordion.Header>
            <Accordion.Body>
                {messagesByLogGroup.length ? <ul>{messagesByLogGroup.map(r => { return (<li>{r}</li>)})}</ul> : "No LogGroup related messages"}
            </Accordion.Body>
        </Accordion.Item>

}

export default CloudFormationToDataDog