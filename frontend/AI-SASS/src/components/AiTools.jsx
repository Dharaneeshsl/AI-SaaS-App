import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AiToolsData } from '../assets/assets';

const AiTools = ({ variant = 'grid', activeSidebar, onCloseSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = true;

  if (variant === 'sidebar') {
    return (
      <div className='space-y-1'>
        {AiToolsData.map((tool) => {
          const isActive = location.pathname === tool.path;
          return (
            <div 
              key={tool.path}
              onClick={() => {
                navigate(tool.path);
                if (window.innerWidth < 640 && onCloseSidebar) {
                  onCloseSidebar();
                }
              }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors
                ${isActive 
                  ? 'bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white' 
                  : 'hover:bg-gray-50 text-gray-700'}`}
            >
              <tool.Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
              <span className='text-sm font-medium'>{tool.title}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className='px-4 sm:px-20 xl:px-32 my-24'>
      <div className='text-center'>
        <h2 className='text-slate-700 text-[42px] font-semibold'>Powerful AI Tools</h2>
        <p className='text-gray-500 max-w-lg mx-auto'>
          Everything you need to create, enhance, and optimize your content with cutting-edge AI technology.
        </p>
      </div>

      <div className='flex flex-wrap mt-10 justify-center'>
        {AiToolsData.map((tool, index) => (
          <div
            key={tool.path}
            className='p-8 m-4 max-w-xs rounded-lg bg-[#FDFDFE] shadow-lg border border-gray-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer'
            onClick={() => user && navigate(tool.path)}
          >
            <tool.Icon
              className='w-12 h-12 p-3 text-white rounded-xl'
              style={{
                background: `linear-gradient(to bottom, ${tool.bg.from}, ${tool.bg.to})`,
              }}
            />
            <h3 className='mt-6 mb-3 text-lg font-semibold'>{tool.title}</h3>
            <p className='text-gray-400 text-sm max-w-[95%]'>{tool.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiTools;
