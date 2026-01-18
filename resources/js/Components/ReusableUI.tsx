import React from 'react';
import Icon from './Icon';
import { createPortal } from 'react-dom';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost';
  icon?: string;
  isLoading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', icon, isLoading, className = '', ...props
}) => {
  const baseClasses = "flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primary hover:bg-primary/90 text-white focus:ring-primary/50 shadow-sm",
    secondary: "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-200 dark:focus:ring-gray-700",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500/50 shadow-sm",
    warning: "bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500/50 shadow-sm",
    ghost: "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800",
  };

  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {isLoading && <Icon name="progress_activity" className="animate-spin text-lg" />}
      {!isLoading && icon && <Icon name={icon} className="text-lg" />}
      {children}
    </button>
  );
};

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white dark:bg-[#19222c] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm ${className}`}
  >
    {children}
  </div>
);

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onAction?: () => void;
    actionIcon?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actionLabel, onAction, actionIcon = "add" }) => (
  <div className="flex flex-wrap justify-between items-center gap-4">
    <div className="flex flex-col gap-1">
      <h1 className="text-gray-900 dark:text-white text-3xl font-bold leading-tight tracking-tight">{title}</h1>
      <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">{subtitle}</p>
    </div>
    {actionLabel && onAction && (
      <Button onClick={onAction} icon={actionIcon}>
        {actionLabel}
      </Button>
    )}
  </div>
);

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, className = '', ...props }) => (
  <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`} {...props}>
    {children}
  </label>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input
    className={`w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    {...props}
  />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className = '', children, ...props }) => (
  <div className="relative">
    <select
      className={`w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark px-4 py-2.5 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400">
      <Icon name="expand_more" />
    </div>
  </div>
);

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, className = '', ...props }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <input
      type="checkbox"
      className="w-5 h-5 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
      {...props}
    />
    {label && (
      <label htmlFor={props.id} className="text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer select-none">
        {label}
      </label>
    )}
  </div>
);

interface SearchFilterBarProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    placeholder?: string;
    children?: React.ReactNode;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({ searchValue, onSearchChange, placeholder = "Search...", children }) => (
  <Card className="w-full p-4">
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <label className="flex flex-col w-full">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-12 group">
            <div className="text-gray-400 dark:text-gray-500 flex bg-gray-50 dark:bg-background-dark items-center justify-center pl-4 rounded-l-lg border border-gray-300 dark:border-gray-700 border-r-0 group-focus-within:border-primary/50 group-focus-within:border-r-0 transition-colors">
              <Icon name="search" />
            </div>
            <input
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-0 border border-gray-300 dark:border-gray-700 border-l-0 bg-gray-50 dark:bg-background-dark h-full placeholder:text-gray-400 dark:placeholder:text-gray-500 px-4 pl-2 text-base font-normal leading-normal group-focus-within:border-primary/50 group-focus-within:border-l-0 transition-colors"
              placeholder={placeholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </label>
      </div>
      {children}
    </div>
  </Card>
);

export const Table: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <Card className="w-full overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        {children}
      </table>
    </div>
  </Card>
);

export const Thead: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <thead>
    <tr className="bg-gray-50 dark:bg-background-dark border-b border-gray-200 dark:border-gray-800">
      {children}
    </tr>
  </thead>
);

export const Th: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = "" }) => (
  <th className={`px-6 py-4 text-left text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

export const Tbody: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
    {children}
  </tbody>
);

export const Td: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = "" }) => (
  <td className={`h-[72px] px-6 py-4 whitespace-nowrap text-sm ${className}`}>
    {children}
  </td>
);

export const EmptyState: React.FC<{message: string, colSpan: number}> = ({ message, colSpan }) => (
  <tr>
    <td colSpan={colSpan} className="h-32 text-center text-gray-500 dark:text-gray-400 italic">
      {message}
    </td>
  </tr>
);

export const Pagination: React.FC = () => (
  <div className="flex items-center justify-center p-4">
    <div className="flex gap-2">
      <Button variant="ghost" className="size-9 p-0 rounded-lg"><Icon name="chevron_left" /></Button>
      <Button variant="primary" className="size-9 p-0 rounded-lg">1</Button>
      <Button variant="ghost" className="size-9 p-0 rounded-lg"><Icon name="chevron_right" /></Button>
    </div>
  </div>
);

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'gray';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'gray', className = '' }) => {
  const variants = {
    success: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    error: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    info: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    primary: 'bg-primary/10 text-primary border-primary/20',
    gray: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, maxWidth = "max-w-md" }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity overflow-y-auto">

      <div className="absolute inset-0" onClick={onClose}></div>

      <Card className={`relative w-full ${maxWidth} transform transition-all animate-fade-in-up my-8 shadow-2xl z-10`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Icon name="close" className="text-2xl" />
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>

        {footer && (
          <div className="flex justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-background-dark/50 rounded-b-xl">
            {footer}
          </div>
        )}
      </Card>
    </div>,
    document.body
  );
};

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    status: 'success' | 'error';
    title: string;
    message: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen, onClose, status, title, message
}) => {
  if (!isOpen) return null;

  const isSuccess = status === 'success';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-sm">
       <div className="flex flex-col items-center text-center gap-4 pt-4">
          <div className={`size-16 rounded-full flex items-center justify-center ${
            isSuccess ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          } animate-fade-in`}>
            <Icon name={isSuccess ? "check_circle" : "error"} className="text-4xl" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {message}
            </p>
          </div>
        </div>
        <div className="flex gap-3 pt-6 justify-center">
          <Button variant={isSuccess ? "primary" : "danger"} onClick={onClose} className="w-full">
             {isSuccess ? "Continue" : "Close"}
          </Button>
        </div>
    </Modal>
  );
};

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen, onClose, onConfirm, title, message, confirmLabel = "Confirm", cancelLabel = "Cancel", variant = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-sm">
       <div className="flex flex-col items-center text-center gap-4">
          <div className={`size-12 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'}`}>
            <Icon name="warning" className="text-3xl" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {message}
            </p>
          </div>
        </div>
        <div className="flex gap-3 pt-6 justify-center">
          <Button variant="secondary" onClick={onClose} className="flex-1">
             {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} className="flex-1">
             {confirmLabel}
          </Button>
        </div>
    </Modal>
  );
};
