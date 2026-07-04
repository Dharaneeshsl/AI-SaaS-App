import ToolPage from '../components/ToolPage'

const RemoveObject = () => {
  return (
    <ToolPage
      title="Object Removal"
      description="Upload an image and describe the object that should be removed from the final asset."
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
