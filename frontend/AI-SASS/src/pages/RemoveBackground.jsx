import ToolPage from '../components/ToolPage'

const RemoveBackground = () => {
  return (
    <ToolPage
      title="Background Removal"
      description="Upload an image and prepare it for transparent-background processing."
      outputType="background"
      submitLabel="Remove background"
      fields={[
        { name: 'image', label: 'Image', type: 'file', accept: 'image/*' },
      ]}
    />
  )
}

export default RemoveBackground
