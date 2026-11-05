import ToolPage from '../components/ToolPage'

const RemoveBackground = () => {
  return (
    <ToolPage
      title="Background Removal"
      description="Upload a PNG, JPEG, or WebP image up to 5 MB for a transparent cutout. Sample mode shows a demonstration only."
      outputType="background"
      submitLabel="Remove background"
      fields={[
        { name: 'image', label: 'Image', type: 'file', accept: 'image/png,image/jpeg,image/webp', required: true },
      ]}
    />
  )
}

export default RemoveBackground
