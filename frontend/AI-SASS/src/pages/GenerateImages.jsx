import ToolPage from '../components/ToolPage'

const GenerateImages = () => {
  return (
    <ToolPage
      title="AI Image Generation"
      description="Create an image from your idea and preferred visual style. Sample mode returns an image brief."
      outputType="image"
      submitLabel="Generate image"
      fields={[
        { name: 'prompt', label: 'Image prompt', type: 'textarea', rows: 4, placeholder: 'A clean SaaS dashboard floating over a modern workspace', required: true },
        { name: 'style', label: 'Style', type: 'select', options: ['Realistic', 'Editorial', 'Product render', 'Minimal', 'Anime'] },
      ]}
    />
  )
}

export default GenerateImages
