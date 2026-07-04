import ToolPage from '../components/ToolPage'

const ReviewResume = () => {
  return (
    <ToolPage
      title="Resume Reviewer"
      description="Paste resume text and target role details to receive a focused improvement review."
      outputType="resume"
      submitLabel="Review resume"
      fields={[
        { name: 'role', label: 'Target role', placeholder: 'Senior Frontend Engineer' },
        { name: 'resume', label: 'Resume text', type: 'textarea', rows: 8, placeholder: 'Paste resume content here...' },
      ]}
    />
  )
}

export default ReviewResume
