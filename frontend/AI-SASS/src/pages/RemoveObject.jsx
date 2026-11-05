import ToolPage from '../components/ToolPage'

const RemoveObject = () => {
  return (
    <ToolPage
      title="Object Removal"
      description="Upload a PNG, JPEG, or WebP image up to 5 MB and describe the object to remove. Sample mode shows a demonstration only."
      outputType="object"
      submitLabel="Remove object"
      fields={[
        { name: 'image', label: 'Image', type: 'file', accept: 'image/png,image/jpeg,image/webp', required: true },
        { name: 'objectName', label: 'Object to remove', placeholder: 'Coffee cup on the desk', required: true },
      ]}
    />
  )
}

export default RemoveObject
