import React from 'react';
import './index.css';
import pick from 'lodash/pick';
import { setup } from '@contentful/dam-app-base';
import { render } from 'react-dom';
import{EntityList} from '@contentful/f36-components'
import  { useState, useEffect } from 'react';

//https://app.contentful.com/spaces/1vt6sxbf70mi/entries?id=DWoghNZk2wKqdFly&order.fieldId=updatedAt&page=1&filters.0.key=sys.version&filters.0.val=1
//cdn.contentful.com/spaces/1vt6sxbf70mi/environments/master-2020-10-29/entries/4MNoEX6UyF5slKeBTlrs7E?access_token=MdueSlugKGMuQ9ovuSFMfGc8Emo-dpSBxInirGXtrF4
const DialogLocation = ({sdk}) =>{
 
  sdk.window.updateHeight(500)
  const [damData,setDAMData] = useState([]);

  useEffect(() => {
    console.log('useEffect')
    fetch('/dam_api_response.json')
    .then((response)=>response.json())
    .then(setDAMData)
  },[]);

  const cardClicked = (props) =>{
    sdk.close([props])
  }

  if(damData){
    return(
      <>
        <EntityList>
          {
              damData.map((item) =>
                <EntityList.Item
                  title={item.name}
                  description="Description"
                  thumbnailUrl={item.url}
                  onClick={()=>cardClicked(item)}/>  
              )
          }
        </EntityList>
      </>
    )
  }else{
      return(<div>Please wait</div>)
  }
}
const CTA = 'Sample DAM Demo App';

const FIELDS_TO_PERSIST = [
'id',
'filename',
'url'
];

function makeThumbnail(attachment) {
  console.log('makeThumbnail',attachment)
  const thumbnail = attachment.thumbnail_url || attachment.url;
  const url = typeof thumbnail === 'string' ? thumbnail : undefined;
  const alt = attachment.filename;
  console.log(url,alt)
  return [url, alt];
}

async function renderDialog(sdk) {

  console.log(sdk.parameters.installation)

  const container = document.createElement('div');
  container.id = 'my-dialog'
  document.body.appendChild(container);

  render(<DialogLocation sdk={sdk} />, document.getElementById('my-dialog'));
  sdk.window.startAutoResizer();
}

async function openDialog(sdk, _currentValue, config) {

  const result = await sdk.dialogs.openCurrentApp({
    position: 'center',
    title: CTA,
    shouldCloseOnOverlayClick: true,
    shouldCloseOnEscapePress: true,
    parameters: { ...config },
    width: 400,
    allowHeightOverflow: true,
  });

  console.log('result',result)

  if (!Array.isArray(result)) {
    console.log('result is empty')
    return [];
  }
  return result.map((asset) => pick(asset, FIELDS_TO_PERSIST));
}


function validateParameters({api_key,project_config_id}){

  if(api_key == null || api_key ==='')
    return "Please add API Key"

  return null

}

setup({
  cta: CTA,
  name: 'Contentful DAM Demo App',
  logo: 'https://images.ctfassets.net/fo9twyrwpveg/6eVeSgMr2EsEGiGc208c6M/f6d9ff47d8d26b3b238c6272a40d3a99/contentful-logo.png',
  color: '#036FE3',
  description:
    'This is a sample Application to share our experience how simple is it to make a custom DAM application on top of Contentful.',
  parameterDefinitions: [
    {
      id: 'api_key',
      type: 'Symbol',
      name: 'API KEY',
      description:
        'Provide the API key here',
      required: true,
    },
    {
      id: 'project_config_id',
      type: 'Number',
      name: 'Project Configuration Id',
      description:
        'Provide the Project Configuration Id here',
      required: true,
    }
  ],
  validateParameters,
  makeThumbnail,
  renderDialog,
  openDialog,
  isDisabled: () => false,
});