import ToolPage from '../components/ToolPage'

const WriteArticle = () => {
  return (
    <ToolPage
      title="AI Article Writer"
      description="Draft structured long-form content from a topic, tone, and target length."
      outputType="article"
      submitLabel="Write article"
      fields={[
        { name: 'topic', label: 'Topic', placeholder: 'How small teams can adopt AI safely' },
        { name: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Friendly', 'Persuasive', 'Educational'] },
        { name: 'length', label: 'Length', type: 'select', options: ['Short', 'Medium', 'Long'] },
      ]}
    />
  )
}

export default WriteArticle
