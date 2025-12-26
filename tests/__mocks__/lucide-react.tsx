import React from 'react';

const createIcon = (name: string) => {
  const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg data-testid={`icon-${name}`} {...props} />
  );
  Icon.displayName = name;
  return Icon;
};

export const Calendar = createIcon('Calendar');
export const MessageSquare = createIcon('MessageSquare');
export const Phone = createIcon('Phone');
export const Mail = createIcon('Mail');
export const User = createIcon('User');
export const CheckCircle = createIcon('CheckCircle');
export const AlertCircle = createIcon('AlertCircle');
export const Loader2 = createIcon('Loader2');
export const ShieldCheck = createIcon('ShieldCheck');
export const Sparkles = createIcon('Sparkles');
export const Clock = createIcon('Clock');
export const Building = createIcon('Building');
export const Building2 = createIcon('Building2');
export const MessageCircle = createIcon('MessageCircle');
export const DollarSign = createIcon('DollarSign');
export const Zap = createIcon('Zap');
export const Smartphone = createIcon('Smartphone');
export const Headphones = createIcon('Headphones');
export const FileText = createIcon('FileText');
export const BadgePercent = createIcon('BadgePercent');
export const Search = createIcon('Search');
export const X = createIcon('X');
export const Filter = createIcon('Filter');
export const ChevronUp = createIcon('ChevronUp');
export const ChevronDown = createIcon('ChevronDown');
export const Sun = createIcon('Sun');
export const Moon = createIcon('Moon');
export const ChevronLeft = createIcon('ChevronLeft');
export const ChevronRight = createIcon('ChevronRight');
export const ArrowLeft = createIcon('ArrowLeft');
export const Check = createIcon('Check');
export const AlertTriangle = createIcon('AlertTriangle');
export const Bell = createIcon('Bell');
export const CalendarIcon = createIcon('CalendarIcon');
export const BarChart3 = createIcon('BarChart3');
export const Download = createIcon('Download');

export default {} as any;


