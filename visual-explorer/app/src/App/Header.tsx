import React from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import styled from 'styled-components';
import Icons from 'res/icons';
import { Redirect } from 'react-router-dom';

const HeaderContainer = styled.div`
    flex: 0 0 auto;
`;

const StyledNavbar = styled(Navbar)`
    box-shadow: 0 0 10px var(--dark);
    z-index: 2000;
`;

const Header = () => {
    return (
        <HeaderContainer>
            <StyledNavbar bg="light" variant="light">
                <Navbar.Brand>
                    <Icons.SDLLogoBlue
                        size={28}
                        style={{ marginRight: '12px', marginTop: '4px', marginBottom: '4px' }}
                    />
                    <b>SDL</b> Visual Explorer
                </Navbar.Brand>
                <Nav className="mr-auto">
                    <Redirect exact from="/" to="/time-series-graph" />
                    <LinkContainer to="/data-profiling" activeStyle={{ color: '--var(light)' }}>
                        <Nav.Link>Data Profiling</Nav.Link>
                    </LinkContainer>
                    <LinkContainer to="/v-plots" activeStyle={{ color: '--var(light)' }}>
                        <Nav.Link>V-Plots</Nav.Link>
                    </LinkContainer>
                    <LinkContainer to="/simsearch" activeStyle={{ color: '--var(light)' }}>
                        <Nav.Link>SimSearch</Nav.Link>
                    </LinkContainer>
                    <LinkContainer to="/hierarchical-graph" activeStyle={{ color: '--var(light)' }}>
                        <Nav.Link>Hierarchical Graph</Nav.Link>
                    </LinkContainer>
                    <LinkContainer to="/time-series-graph" activeStyle={{ color: '--var(light)' }}>
                        <Nav.Link>Time Series Graph</Nav.Link>
                    </LinkContainer>
                    <LinkContainer to="/entity-resolution" activeStyle={{ color: '--var(light)' }}>
                        <Nav.Link>Entity Resolution</Nav.Link>
                    </LinkContainer>
                </Nav>
                <Nav className="mr-sm-2">
                    <Nav.Link href="/imprint">Imprint</Nav.Link>
                    <Nav.Link href="/about">About</Nav.Link>
                </Nav>
            </StyledNavbar>
        </HeaderContainer>
    );
};

export default Header;
