import ToolPage from '../components/ToolPage'

const RemoveBackground = () => {
  return (
    <ToolPage
      title="Background Removal"
      description="Upload an image to generate a transparent-background cutout preview. Fully functional in demo mode without API keys."
      outputType="background"
      submitLabel="Remove background"
      fields={[
        { name: 'image', label: 'Image', type: 'file', accept: 'image/*' },
      ]}
    />
  )
}

export default RemoveBackground
