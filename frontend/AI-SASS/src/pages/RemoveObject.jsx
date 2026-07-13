import ToolPage from '../components/ToolPage'

const RemoveObject = () => {
  return (
    <ToolPage
      title="Object Removal"
      description="Upload an image and describe what to remove. Fully functional preview in demo mode without API keys."
      outputType="object"
      submitLabel="Remove object"
      fields={[
        { name: 'image', label: 'Image', type: 'file', accept: 'image/*' },
        { name: 'objectName', label: 'Object to remove', placeholder: 'Coffee cup on the desk' },
      ]}
    />
  )
}

export default RemoveObject
