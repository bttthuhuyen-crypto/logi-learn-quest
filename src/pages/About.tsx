import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Info, Mail, Globe, Users, BookOpen, Target } from 'lucide-react';

const About = () => {
  const { t } = useLanguage();

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t.about.title}</h1>
          <p className="text-xl text-muted-foreground">{t.about.subtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6 border rounded-lg">
            <Users className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">{t.about.community}</h3>
            <p className="text-sm text-muted-foreground">{t.about.communityDesc}</p>
          </div>
          <div className="text-center p-6 border rounded-lg">
            <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">{t.about.learning}</h3>
            <p className="text-sm text-muted-foreground">{t.about.learningDesc}</p>
          </div>
          <div className="text-center p-6 border rounded-lg">
            <Target className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">{t.about.growth}</h3>
            <p className="text-sm text-muted-foreground">{t.about.growthDesc}</p>
          </div>
        </div>

        <div className="border rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Info className="h-6 w-6 text-primary" />
            {t.about.guidelines}
          </h2>
          <ul className="space-y-3 text-muted-foreground">
            <li>✓ {t.about.guidelineRespect}</li>
            <li>✓ {t.about.guidelineShare}</li>
            <li>✓ {t.about.guidelineNoSpam}</li>
            <li>✓ {t.about.guidelineProfessional}</li>
            <li>✓ {t.about.guidelineSupport}</li>
          </ul>
        </div>

        <div className="mt-12 text-center">
          <h3 className="font-semibold mb-4">{t.about.contact}</h3>
          <div className="flex justify-center gap-6">
            <a href="mailto:hello@10xlogistics.vn" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
              <Mail className="h-5 w-5" />
              hello@10xlogistics.vn
            </a>
            <a href="https://10xlogistics.vn" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
              <Globe className="h-5 w-5" />
              10xlogistics.vn
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default About;
