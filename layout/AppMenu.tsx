'use client';

import React from 'react';
import AppMenuitem from './AppMenuitem';
import { MenuProvider } from './context/menucontext';
import { AppMenuItem } from '@/types';

const AppMenu = () => {
    const model: AppMenuItem[] = [
        {
            label: 'Início',
            items: [{ label: 'Início', icon: 'pi pi-fw pi-home', to: '/' },
                { label: 'Alunos', icon: 'pi pi-fw pi-graduation-cap', to: '/alunos' },
                { label: 'Cursos', icon: 'pi pi-fw pi-book', to: '/cursos' },
                { label: 'Diciplinas', icon: 'pi pi-fw pi-list', to: '/diciplinas' },
                { label: 'Professores', icon: 'pi pi-fw pi-address-book', to: '/professores' },
                { label: 'Turmas', icon: 'pi pi-fw pi-users', to: '/turmas' }

            ]
        }
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
