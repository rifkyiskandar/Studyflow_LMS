import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    return (
        <div style={{ marginTop: '1rem' }}>
            {links.map((link, index) => (
                !link.url ? (
                    <span
                        key={index}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        style={{
                            padding: '0.5rem 0.75rem',
                            margin: '0.25rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            color: '#9ca3af',
                            cursor: 'default',
                        }}
                    />
                ) : (
                    <Link
                        key={index}
                        href={link.url}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        style={{
                            padding: '0.5rem 0.75rem',
                            margin: '0.25rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            backgroundColor: link.active ? '#135bec' : 'white',
                            color: link.active ? 'white' : 'black',
                            cursor: 'pointer',
                        }}
                    />
                )
            ))}
        </div>
    );
}
