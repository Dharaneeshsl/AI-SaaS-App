import ToolPage from '../components/ToolPage'

const Blogtitle = () => {
  return (
    <ToolPage
      title="Blog Title Generator"
      description="Turn a keyword and category into high-intent title options ready for editorial review."
      outputType="title"
      submitLabel="Generate titles"
      fields={[
        { name: 'keyword', label: 'Keyword', placeholder: 'AI automation for agencies' },
        { name: 'category', label: 'Category', type: 'select', options: ['Marketing', 'Technology', 'Startup', 'Product', 'General'] },
      ]}
    />
  )
}

export default Blogtitle
