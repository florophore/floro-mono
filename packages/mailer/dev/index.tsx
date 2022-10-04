import { useEffect} from 'react';

import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import { useMutation, QueryClient, QueryClientProvider, useQuery } from 'react-query';
import DotsLoader from '@floro/storybook/stories/design-system/DotsLoader';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const queryClient = new QueryClient()

const fetchTemplates = async () => {
    const res = await fetch("/templates", {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
    });
    return res.json();
  };

const TemplatesMap = () => {
    const { data, isLoading } = useQuery('templates', fetchTemplates);

    if (isLoading && !data) {
        return (
            <div>
                <DotsLoader size="large" color="purple"/>
            </div>
        )
    }

    return (
      <div>
        {data?.map((template) => {
          return (
            <div key={template.module}>
              <h1>{template.module}</h1>
              {template?.mocks?.map((mock) => {
                return (
                  <div key={mock}>
                    <Link to={`/${template.module}/${mock}`}>
                      {template.module + " with mock " + mock}
                    </Link>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
}

const renderTemplate = async (params) => {
    const res = await fetch("/templates", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(params)
    });
    return res.json();
  };

const Renderer = () => {
    const { componentName, componentMock} = useParams();
    const {data, isLoading, mutate} = useMutation<any, any, any>(renderTemplate);

    useEffect(() => {
        mutate({
            componentName,
            componentMock
        });
    }, [mutate, componentName, componentMock])

    if (isLoading && !data) {
        return (
            <div>
                <DotsLoader size="large" color="purple"/>
            </div>
        )
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          height: "100vh",
        }}
      >
        <div
          style={{
            width: 400,
            padding: 12,
            borderRight: "1px solid",
          }}
        >
          <div style={{marginBottom: 48}}>
            <Link to={"/"}>{"Back to Templates"}</Link>
          </div>
          <h1 style={{ fontSize: "1.5rem" }}>{componentName}</h1>
          <h2 style={{ fontSize: "1.25rem" }}>{`(${componentMock})`}</h2>
          {Object.keys(data?.mocks ?? {})?.map((mockKey) => {
            return (
              <Link key={mockKey} to={`/${componentName}/${mockKey}`}>
                <p>{mockKey}</p>
              </Link>
            );
          })}
          <div>
            <div style={{marginTop: 48}}>
                <SyntaxHighlighter language="json" style={dark}>
                    {JSON.stringify(data?.mocks[componentMock ?? 'default'], null, 2)}
                </SyntaxHighlighter>
            </div>
          </div>
        </div>
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
            background: "#EEE",
          }}
        >
          <div
            style={{
              maxWidth: 600,
              background: "white",
              borderRight: "1px solid gray",
              borderLeft: "1px solid gray",
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: data?.html ?? "" }}></div>
          </div>
        </div>
      </div>
    );
}

const Routing = () => {

    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TemplatesMap />} />
          <Route
            path="/:componentName/:componentMock"
            element={
              <Renderer />
            }
          />
        </Routes>
      </BrowserRouter>
    );
}

const DevApp = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <Routing/>
        </QueryClientProvider>
    );
}

export default DevApp;