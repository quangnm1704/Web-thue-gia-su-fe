import React from 'react';
import { 
  Calculator, 
  Code, 
  Languages, 
  Atom, 
  Briefcase, 
  Palette, 
  Music, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { categories } from '../data/mockData';

const iconMap = {
  Calculator,
  Code,
  Languages,
  Atom,
  Briefcase,
  Palette,
  Music,
  Sparkles
};

export default function CategoriesGrid({ onSelectCategory }) {
  return (
    <section className="ud-categories-section">
      <div className="container">
        <div className="ud-section-header">
          <div className="ud-header-left">
            <h2 className="ud-section-title">Khám phá các danh mục hàng đầu</h2>
            <p className="ud-section-desc">
              Tìm kiếm môn học hoặc kỹ năng bạn mong muốn nâng cao ngay hôm nay.
            </p>
          </div>
        </div>

        <div className="ud-categories-grid">
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Sparkles;
            return (
              <div 
                key={cat.id} 
                className="ud-category-box"
                onClick={() => onSelectCategory && onSelectCategory(cat.id)}
              >
                <div className="category-icon-wrapper">
                  <IconComponent size={28} />
                </div>
                <h3 className="category-title">{cat.name}</h3>
                <p className="category-count">{cat.count}</p>
                <span className="category-arrow">
                  <ArrowRight size={16} />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
