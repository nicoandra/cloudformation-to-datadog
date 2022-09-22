import React, {useState, useEffect} from 'react';
import Form from 'react-bootstrap/Form';

import JSONPretty from 'react-json-pretty';


function CloudFormationToDataDog() {
    const [rawTemplate, setRawTemplate] = useState('')
    const [template, setTemplate] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')


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


    const jsonViewer = () => {
        if (template !== false) {
            return (<JSONPretty id="json-pretty" data={template}></JSONPretty>)
        }

        return "Please paste the CloudFormation Template in the box above."
    }

    return (<Form>

        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>Example textarea</Form.Label>
            <Form.Control as="textarea" rows={3} onChange={(e)=> setRawTemplate(e.target.value.trim())}/>
        </Form.Group>
        The template is {rawTemplate.length} characters long.<br />


        {jsonViewer()}
        
    </Form>)

}

export default CloudFormationToDataDog