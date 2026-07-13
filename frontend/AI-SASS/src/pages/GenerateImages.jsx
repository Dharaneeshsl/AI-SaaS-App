import ToolPage from '../components/ToolPage'

const GenerateImages = () => {
  return (
    <ToolPage
      title="AI Image Generation"
      description="Expand your idea into a production-ready image prompt. Live Claude generation activates when ANTHROPIC_API_KEY is set."
      outputType="image"
      submitLabel="Generate image brief"
      fields={[
        { name: 'prompt', label: 'Image prompt', type: 'textarea', rows: 4, placeholder: 'A clean SaaS dashboard floating over a modern workspace' },
        { name: 'style', label: 'Style', type: 'select', options: ['Realistic', 'Editorial', 'Product render', 'Minimal', 'Anime'] },
      ]}
    />
  )
}

export default GenerateImages
