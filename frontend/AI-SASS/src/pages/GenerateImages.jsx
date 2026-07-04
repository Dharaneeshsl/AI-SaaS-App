import ToolPage from '../components/ToolPage'

const GenerateImages = () => {
  return (
    <ToolPage
      title="AI Image Generation"
      description="Create a production-ready image prompt and preview the request before connecting the image API."
      outputType="image"
      submitLabel="Prepare image"
      fields={[
        { name: 'prompt', label: 'Image prompt', type: 'textarea', rows: 4, placeholder: 'A clean SaaS dashboard floating over a modern workspace' },
        { name: 'style', label: 'Style', type: 'select', options: ['Realistic', 'Editorial', 'Product render', 'Minimal', 'Anime'] },
      ]}
    />
  )
}

export default GenerateImages
